import json
import secrets

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from database import execute_read, execute_write
from llm_pipeline import generate_executive_summary
from models import ExecSummaryRequest, ShareRequest, ShareResponse

router = APIRouter(tags=["share"])


def _generate_share_id() -> str:
    return secrets.token_urlsafe(10)[:12]


@router.post("/share", response_model=ShareResponse)
async def create_share(
    body: ShareRequest,
    _user: dict = Depends(get_current_user),
) -> ShareResponse:
    share_id = _generate_share_id()
    payload = json.dumps({
        "query": body.query,
        "charts": body.charts_data,
        "insights": body.insights,
        "follow_up_suggestions": body.follow_up_suggestions,
        "confidence_score": body.confidence_score,
        "confidence_label": body.confidence_label,
    })
    await execute_write(
        "INSERT INTO shared_dashboards (share_id, payload) VALUES (%s, %s)",
        (share_id, payload),
    )
    return ShareResponse(share_id=share_id, url=f"/d/{share_id}")


@router.get("/share/{share_id}")
async def get_share(share_id: str) -> dict:
    rows = await execute_read(
        "SELECT payload FROM shared_dashboards WHERE share_id = %s LIMIT 1",
        (share_id,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Shared dashboard not found")
    return json.loads(rows[0]["payload"])


@router.post("/executive-summary")
async def executive_summary(
    body: ExecSummaryRequest,
    _user: dict = Depends(get_current_user),
) -> dict:
    text = await generate_executive_summary(
        query=body.query,
        insights=body.insights,
        charts_data=body.charts_data,
    )
    return {"summary": text}
