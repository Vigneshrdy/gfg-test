"""
Rule-based chart type selection and data formatting for Recharts.
No LLM calls here — pure deterministic logic for fast, predictable results.
"""

from decimal import Decimal
from datetime import date, datetime

CHART_COLORS = [
    "#6366f1", "#f59e0b", "#10b981", "#ef4444",
    "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
]

_TIME_KEYWORDS = {"month", "year", "date", "week", "quarter", "day", "period", "time"}
_PCT_KEYWORDS = {"pct", "percent", "percentage", "ratio", "share", "rate", "proportion"}


# ── Type helpers ──────────────────────────────────────────────────────────────
def _col_types(rows: list[dict]) -> dict[str, str]:
    """Classify each column as 'numeric', 'date_str', or 'string'."""
    if not rows:
        return {}
    types: dict[str, str] = {}
    sample = rows[0]
    for k, v in sample.items():
        if isinstance(v, (int, float, Decimal)):
            types[k] = "numeric"
        elif isinstance(v, (date, datetime)):
            types[k] = "date_str"
        elif isinstance(v, str):
            # Detect YYYY-MM or YYYY-MM-DD patterns
            stripped = v.strip()
            if len(stripped) in (7, 10) and stripped.count("-") in (1, 2):
                types[k] = "date_str"
            else:
                types[k] = "string"
        else:
            types[k] = "string"
    return types


def _serialize(v):
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (date, datetime)):
        return v.isoformat()
    return v


def _serialize_row(row: dict) -> dict:
    return {k: _serialize(v) for k, v in row.items()}


# ── Chart-type selection ──────────────────────────────────────────────────────
def _select_chart(
    rows: list[dict],
    col_types: dict[str, str],
    rec: dict | None,
) -> tuple[str, str, str, str | None]:
    """
    Returns (chart_type, x_col, y_col, color_by_col).
    `rec` is a dict from chart_recommendations if the LLM provided one.
    """
    if rec:
        ct = rec.get("type", "bar")
        xk = rec.get("x_axis", "")
        yk = rec.get("y_axis", "")
        cb = rec.get("color_by") or None
        # Validate that recommended columns actually exist in data
        cols = set(rows[0].keys()) if rows else set()
        if xk not in cols:
            xk = next(iter(cols), "")
        if yk not in cols:
            numeric = [c for c, t in col_types.items() if t == "numeric"]
            yk = numeric[0] if numeric else ""
        return ct, xk, yk, cb

    numeric_cols = [c for c, t in col_types.items() if t == "numeric"]
    string_cols = [c for c, t in col_types.items() if t == "string"]
    date_cols = [c for c, t in col_types.items() if t == "date_str"]

    # Time-series → line
    if date_cols and numeric_cols:
        color_by = string_cols[0] if string_cols else None
        return "line", date_cols[0], numeric_cols[0], color_by

    # Scatter: two numerics, no category
    if len(numeric_cols) >= 2 and not string_cols and not date_cols:
        return "scatter", numeric_cols[0], numeric_cols[1], None

    if string_cols and numeric_cols:
        x = string_cols[0]
        y = numeric_cols[0]
        n_cats = len({str(r.get(x, "")) for r in rows})

        # Pie: single category + percentage-like column, ≤ 8 slices
        is_pct = any(kw in y.lower() for kw in _PCT_KEYWORDS)
        if is_pct and n_cats <= 8:
            return "pie", x, y, None

        if n_cats > 8:
            return "table", x, y, None

        color_by = string_cols[1] if len(string_cols) > 1 else None
        return "bar", x, y, color_by

    cols = list(col_types.keys())
    return "table", cols[0] if cols else "id", cols[1] if len(cols) > 1 else "", None


# ── Data formatting ───────────────────────────────────────────────────────────
def _format_data(
    rows: list[dict],
    chart_type: str,
    x_col: str,
    y_col: str,
    color_by: str | None,
) -> tuple[list[dict], dict]:
    """
    Returns (recharts_data, config_dict) where config matches the frontend
    ChartConfig type: { xKey, yKey, colorBy, colors }.
    """
    serialized = [_serialize_row(r) for r in rows]

    # Pie chart: [{name, value}]
    if chart_type == "pie":
        data = [
            {"name": str(r.get(x_col, "")), "value": r.get(y_col, 0)}
            for r in serialized
        ]
        config = {"xKey": "name", "yKey": "value", "colorBy": None, "colors": CHART_COLORS}
        return data, config

    # Multi-series: pivot on color_by into separate yKey columns
    if color_by and color_by in (serialized[0] if serialized else {}):
        pivoted: dict[str, dict] = {}
        series_set: list[str] = []
        for row in serialized:
            x_val = str(row.get(x_col, ""))
            series_val = str(row.get(color_by, ""))
            if x_val not in pivoted:
                pivoted[x_val] = {x_col: row.get(x_col)}
            pivoted[x_val][series_val] = row.get(y_col, 0)
            if series_val not in series_set:
                series_set.append(series_val)
        data = list(pivoted.values())
        config = {
            "xKey": x_col,
            "yKey": series_set[0] if series_set else y_col,
            "colorBy": color_by,
            "colors": CHART_COLORS[: len(series_set)],
        }
        return data, config

    # Simple flat data
    config = {
        "xKey": x_col,
        "yKey": y_col,
        "colorBy": None,
        "colors": CHART_COLORS[:1],
    }
    return serialized, config


# ── Public API ────────────────────────────────────────────────────────────────
def build_charts(rows: list[dict], chart_recommendations: list[dict]) -> list[dict]:
    """
    Convert raw SQL rows into a list of Chart-compatible dicts.
    Uses LLM recommendations when available; falls back to rule-based detection.
    Returns at most 3 charts.
    """
    if not rows:
        return []

    col_types = _col_types(rows)
    charts: list[dict] = []
    recs = chart_recommendations[:3] if chart_recommendations else [None]

    for i, rec in enumerate(recs):
        chart_type, x_col, y_col, color_by = _select_chart(rows, col_types, rec)

        # Skip if we couldn't resolve essential columns
        if not x_col or not y_col:
            continue

        data, config = _format_data(rows, chart_type, x_col, y_col, color_by)

        charts.append(
            {
                "chart_id": f"chart_{i + 1}",
                "chart_type": chart_type,
                "title": (rec or {}).get("title", f"Chart {i + 1}"),
                "description": (rec or {}).get("reasoning", ""),
                "data": data,
                "config": config,
            }
        )

    # Guarantee at least one chart
    if not charts:
        first_cols = list(col_types.keys())
        charts.append(
            {
                "chart_id": "chart_1",
                "chart_type": "table",
                "title": "Query Results",
                "description": "",
                "data": [_serialize_row(r) for r in rows],
                "config": {
                    "xKey": first_cols[0] if first_cols else "id",
                    "yKey": first_cols[1] if len(first_cols) > 1 else first_cols[0] if first_cols else "",
                    "colorBy": None,
                    "colors": CHART_COLORS,
                },
            }
        )

    return charts
