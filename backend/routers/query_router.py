from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from llm_pipeline import run_query_pipeline
from models import QueryRequest, QueryResponse

router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse)
async def query_endpoint(
    body: QueryRequest,
    _user: dict = Depends(get_current_user),
) -> QueryResponse:
    """
    Main BI query endpoint.

    Accepts a natural-language business question, runs the multi-step LLM
    pipeline (SQL generation → execution → chart selection → insights) and
    returns a fully structured dashboard payload ready for the React frontend.
    """
    result = await run_query_pipeline(
        query=body.query,
        conversation_history=[m.model_dump() for m in body.conversation_history],
        uploaded_schema=body.uploaded_schema,
    )
    return result
