from fastapi import APIRouter, Depends

from auth import get_current_user
from database import get_live_schema
from models import SchemaResponse, TableColumn, TableInfo
from schema_cache import NEXAMART_SCHEMA_FOR_LLM

router = APIRouter(tags=["schema"])


@router.get("/schema", response_model=SchemaResponse)
async def schema_endpoint(_user: dict = Depends(get_current_user)):
    """
    Returns the live database schema (fetched from information_schema)
    plus the pre-formatted string used as LLM context.
    """
    raw_tables = await get_live_schema()
    tables = [
        TableInfo(
            name=t["name"],
            row_count=t["row_count"],
            columns=[
                TableColumn(
                    name=c["name"],
                    type=c["type"],
                    nullable=c["nullable"],
                )
                for c in t["columns"]
            ],
        )
        for t in raw_tables
    ]
    return SchemaResponse(tables=tables, schema_string=NEXAMART_SCHEMA_FOR_LLM)


@router.get("/health")
async def health():
    """Liveness probe — no auth required."""
    return {"status": "ok", "service": "QueryMind API"}
