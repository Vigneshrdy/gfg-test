"""
Multi-step LLM pipeline for the /api/query endpoint.

Pipeline:
  1. Schema-aware SQL generation (LLM call #1)
  2. Execute SQL against MySQL (with 1 automatic retry on syntax error)
  3. Rule-based chart type selection + Recharts formatting
  4. Insight + follow-up generation (LLM call #2)
  5. Return structured QueryResponse
"""

import json
import logging
import time
import uuid
from typing import Any

import httpx

from chart_logic import build_charts
from config import settings
from database import execute_llm_sql
from models import QueryResponse
from prompts import (
    EXECUTIVE_SUMMARY_PROMPT,
    EXPLAIN_CHART_PROMPT,
    INSIGHT_AND_FOLLOWUP_PROMPT,
    SCHEMA_AWARE_SQL_RETRY_PROMPT,
    SCHEMA_AWARE_SQL_SYSTEM_PROMPT,
)
from schema_cache import NEXAMART_SCHEMA_FOR_LLM

logger = logging.getLogger(__name__)


def _openrouter_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "QueryMind",
    }


# ── OpenRouter helpers ────────────────────────────────────────────────────────
async def _chat_json(messages: list[dict], temperature: float = 0.1) -> dict:
    """Call the LLM via OpenRouter with JSON mode and return parsed dict."""
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 2048,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers=_openrouter_headers(),
            json=payload,
        )
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"] or "{}"
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("LLM returned non-JSON: %s", raw[:200])
        return {"success": False, "error": "LLM returned non-JSON response"}


async def _chat_text(messages: list[dict], temperature: float = 0.3) -> str:
    """Call the LLM via OpenRouter and return plain text."""
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 1024,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers=_openrouter_headers(),
            json=payload,
        )
        resp.raise_for_status()
        return (resp.json()["choices"][0]["message"]["content"] or "").strip()


# ── Conversation history formatter ───────────────────────────────────────────
def _fmt_history(history: list[dict]) -> str:
    if not history:
        return "(no prior conversation)"
    lines = []
    for msg in history[-6:]:  # last 3 turns = 6 messages
        role = msg.get("role", "user")
        content = msg.get("content", "")
        lines.append(f"{role.upper()}: {content}")
    return "\n".join(lines)


# ── Step 1 — SQL generation ───────────────────────────────────────────────────
async def _generate_sql(
    user_query: str,
    schema: str,
    conversation_history: list[dict],
) -> dict:
    system_prompt = SCHEMA_AWARE_SQL_SYSTEM_PROMPT.format(
        schema=schema,
        conversation_history=_fmt_history(conversation_history),
        user_query=user_query,
    )
    messages = [{"role": "system", "content": system_prompt}]
    return await _chat_json(messages)


async def _retry_sql(
    user_query: str,
    schema: str,
    failed_sql: str,
    error_message: str,
) -> dict:
    prompt = SCHEMA_AWARE_SQL_RETRY_PROMPT.format(
        user_query=user_query,
        failed_sql=failed_sql,
        error_message=error_message,
        schema=schema,
    )
    messages = [{"role": "user", "content": prompt}]
    return await _chat_json(messages)


# ── Step 2 — SQL execution ────────────────────────────────────────────────────
async def _safe_execute(sql: str) -> tuple[list[dict] | None, str | None]:
    """Returns (rows, error). One of them will be None."""
    try:
        rows = await execute_llm_sql(sql)
        return rows, None
    except Exception as exc:
        return None, str(exc)


# ── Step 4 — Insights + follow-ups ───────────────────────────────────────────
async def _generate_insights(
    original_query: str,
    sql: str,
    rows: list[dict],
) -> tuple[list[str], list[str], int, str, list[dict]]:
    sample = rows[:50]
    col_names = list(rows[0].keys()) if rows else []

    prompt = INSIGHT_AND_FOLLOWUP_PROMPT.format(
        original_query=original_query,
        sql=sql,
        data_sample=json.dumps(sample, default=str),
        row_count=len(rows),
        columns=', '.join(col_names),
    )
    messages = [{'role': 'user', 'content': prompt}]
    result = await _chat_json(messages, temperature=0.4)

    insights = result.get('insights', [])[:5]
    follow_ups = result.get('follow_up_suggestions', [])[:3]
    confidence_score = int(result.get('confidence_score') or 75)
    confidence_label = str(result.get('confidence_label') or 'Moderate confidence')
    anomalies = result.get('anomalies') or []
    return insights, follow_ups, confidence_score, confidence_label, anomalies


# Chart explanation
async def explain_chart(
    chart_title: str,
    chart_type: str,
    chart_description: str,
    data_sample: list[dict],
    original_query: str,
) -> str:
    prompt = EXPLAIN_CHART_PROMPT.format(
        original_query=original_query,
        chart_title=chart_title,
        chart_type=chart_type,
        chart_description=chart_description,
        data_sample=json.dumps(data_sample[:20], default=str),
    )
    return await _chat_text([{'role': 'user', 'content': prompt}], temperature=0.4)


# ── Public entry point ────────────────────────────────────────────────────────
async def run_query_pipeline(
    query: str,
    conversation_history: list[dict],
    uploaded_schema: str | None,
    plan: str = "free",
) -> QueryResponse:
    t0 = time.time()
    conversation_id = str(uuid.uuid4())
    schema = uploaded_schema or NEXAMART_SCHEMA_FOR_LLM

    def _elapsed() -> float:
        return round(time.time() - t0, 2)

    def _error(msg: str, reason: str | None = None, suggestions: list[str] | None = None) -> QueryResponse:
        return QueryResponse(
            success=False,
            conversation_id=conversation_id,
            error=msg,
            error_reason=reason,
            suggestions=suggestions,
            generated_in=_elapsed(),
        )

    # ── Step 1: Generate SQL ──────────────────────────────────────────────────
    try:
        sql_result = await _generate_sql(query, schema, conversation_history)
    except Exception as exc:
        logger.exception("SQL generation failed")
        return _error(f"LLM error during SQL generation: {exc}")

    if not sql_result.get("success", False):
        return QueryResponse(
            success=False,
            conversation_id=conversation_id,
            error=sql_result.get("error", "Query could not be answered"),
            error_reason=sql_result.get("reason"),
            suggestions=sql_result.get("suggestions", []),
            generated_in=_elapsed(),
        )

    sql: str = (sql_result.get("sql") or "").strip()
    chart_recs: list[dict] = sql_result.get("chart_recommendations", [])

    if not sql:
        return _error("LLM returned an empty SQL query.")

    # ── Step 2: Execute SQL ───────────────────────────────────────────────────
    rows, exec_error = await _safe_execute(sql)

    if exec_error:
        logger.warning("SQL execution error: %s | SQL: %s", exec_error, sql[:200])
        # One automatic retry with error context
        try:
            retry_result = await _retry_sql(query, schema, sql, exec_error)
            if retry_result.get("success") and retry_result.get("sql"):
                retry_sql = retry_result["sql"].strip()
                rows, exec_error2 = await _safe_execute(retry_sql)
                if exec_error2:
                    return _error(
                        f"SQL failed even after retry: {exec_error2}",
                        reason=f"Original error: {exec_error}",
                    )
                sql = retry_sql
                chart_recs = retry_result.get("chart_recommendations", chart_recs)
            else:
                return _error(f"SQL execution error: {exec_error}")
        except Exception as retry_exc:
            return _error(f"SQL execution error: {exec_error}")

    # ── Step 3: Empty result guard ────────────────────────────────────────────
    if not rows:
        return QueryResponse(
            success=False,
            conversation_id=conversation_id,
            sql_generated=sql,
            error="No data found",
            error_reason=(
                "The query executed successfully but returned 0 rows. "
                "The data you're looking for may not exist for the specified filters, "
                "dates, or categories."
            ),
            suggestions=[
                "Try a broader date range",
                "Check if the category or region name is spelled correctly",
                "Remove filters to see all available data",
            ],
            generated_in=_elapsed(),
        )

    # ── Step 3: Build charts ──────────────────────────────────────────────────
    # ── Step 3: Build charts ──────────────────────────────────────────────────
    charts_raw = build_charts(rows, chart_recs)
    # Limit charts by plan: pro = 3, free = 1
    max_charts = 3 if plan == "pro" else 1
    charts_raw = charts_raw[:max_charts]
    # ── Step 4: Generate insights + follow-ups ────────────────────────────────
    try:
        insights, follow_ups, confidence_score, confidence_label, anomalies = await _generate_insights(query, sql, rows)
    except Exception as exc:
        logger.warning("Insight generation failed: %s", exc)
        insights, follow_ups, confidence_score, confidence_label, anomalies = [], [], 70, "Moderate confidence", []

    featured_chart_id = charts_raw[0]["chart_id"] if charts_raw else None

    return QueryResponse(
        success=True,
        conversation_id=conversation_id,
        sql_generated=sql,
        charts=[
            {
                "chart_id": c["chart_id"],
                "chart_type": c["chart_type"],
                "title": c["title"],
                "description": c["description"],
                "data": c["data"],
                "config": c["config"],
            }
            for c in charts_raw
        ],
        insights=insights,
        follow_up_suggestions=follow_ups,
        generated_in=_elapsed(),
        confidence_score=confidence_score,
        confidence_label=confidence_label,
        anomalies=anomalies,
        featured_chart_id=featured_chart_id,
    )


async def generate_executive_summary(
    query: str,
    insights: list[str],
    charts_data: list[dict],
) -> str:
    charts_summary = "\n".join(
        f"- {c.get('title', '')} ({c.get('chart_type', '')}): {c.get('description', '')}"
        for c in charts_data[:4]
    ) or "No chart data available."
    insights_text = "\n".join(f"- {i}" for i in insights[:6]) or "No insights available."
    prompt = EXECUTIVE_SUMMARY_PROMPT.format(
        query=query,
        insights=insights_text,
        charts_summary=charts_summary,
    )
    return await _chat_text([{"role": "user", "content": prompt}], temperature=0.35)
