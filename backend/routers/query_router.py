from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from llm_pipeline import run_query_pipeline, explain_chart
from models import QueryRequest, QueryResponse, ExplainChartRequest

router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse)
async def query_endpoint(
    body: QueryRequest,
    user: dict = Depends(get_current_user),
) -> QueryResponse:
    plan = "pro" if user.get("role") in ("admin", "pro") else "free"
    result = await run_query_pipeline(
        query=body.query,
        conversation_history=[m.model_dump() for m in body.conversation_history],
        uploaded_schema=body.uploaded_schema,
        plan=plan,
    )
    return result


@router.post("/explain-chart")
async def explain_chart_endpoint(
    body: ExplainChartRequest,
    _user: dict = Depends(get_current_user),
) -> dict:
    explanation = await explain_chart(
        chart_title=body.chart_title,
        chart_type=body.chart_type,
        chart_description=body.chart_description,
        data_sample=body.data_sample,
        original_query=body.original_query,
    )
    return {"explanation": explanation}
