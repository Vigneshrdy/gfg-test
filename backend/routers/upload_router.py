import io
import uuid

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

import httpx

from auth import get_current_user
from database import bulk_insert, create_table_ddl, drop_table
from models import ColumnInfo, UploadResponse
from config import settings
from prompts import CSV_SCHEMA_DESCRIPTION_PROMPT

router = APIRouter(tags=["upload"])


def _or_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "QueryMind",
    }

_PANDAS_TO_MYSQL: dict[str, str] = {
    "int64": "BIGINT",
    "int32": "INT",
    "float64": "DOUBLE",
    "float32": "FLOAT",
    "bool": "TINYINT(1)",
    "object": "TEXT",
    "datetime64[ns]": "DATETIME",
    "datetime64[ns, UTC]": "DATETIME",
}


def _pandas_dtype_to_mysql(dtype_str: str) -> str:
    return _PANDAS_TO_MYSQL.get(str(dtype_str), "TEXT")


@router.post("/upload-csv", response_model=UploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    _user: dict = Depends(get_current_user),
) -> UploadResponse:
    """
    Accept a CSV file, infer its schema, create a temporary MySQL table,
    load the data, and return a schema description for follow-up queries.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted")

    # 1. Read into pandas
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents), nrows=5000)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse CSV: {exc}")

    if df.empty:
        raise HTTPException(status_code=422, detail="CSV file is empty")

    # Sanitise column names (replace spaces / special chars)
    df.columns = [
        c.strip().lower().replace(" ", "_").replace("-", "_").replace(".", "_")
        for c in df.columns
    ]

    # 2. Build column info
    columns_info: list[ColumnInfo] = []
    for col in df.columns:
        mysql_type = _pandas_dtype_to_mysql(df[col].dtype)
        sample = [str(v) for v in df[col].dropna().head(3).tolist()]
        columns_info.append(ColumnInfo(name=col, mysql_type=mysql_type, sample_values=sample))

    # 3. Create temp table
    table_name = f"uploaded_{uuid.uuid4().hex[:12]}"
    col_defs = ",\n  ".join(f"`{c.name}` {c.mysql_type}" for c in columns_info)
    ddl = f"CREATE TABLE IF NOT EXISTS `{table_name}` (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  {col_defs}\n)"

    try:
        await create_table_ddl(ddl)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create table: {exc}")

    # 4. Bulk insert
    col_names = [c.name for c in columns_info]
    rows = [tuple(row) for row in df[col_names].where(pd.notnull(df), None).values.tolist()]
    try:
        await bulk_insert(table_name, col_names, rows)
    except Exception as exc:
        await drop_table(table_name)
        raise HTTPException(status_code=500, detail=f"Failed to insert data: {exc}")

    # 5. Build a structured schema string the query LLM can use for SQL generation
    col_defs_text = "\n".join(f"  {c.name} ({c.mysql_type})" for c in columns_info)
    sample_rows_text = df.head(3).to_string(index=False)
    col_rows = "\n".join(f"| {c.name} | {c.mysql_type} |" for c in columns_info)
    sample_values_text = "\n".join(
        f"  {c.name}: {', '.join(c.sample_values[:3])}" for c in columns_info
    )
    structured_schema = (
        f"## Uploaded CSV Table\n"
        f"**MySQL table name** (use this EXACTLY in your SQL): `{table_name}`\n\n"
        f"### Table: `{table_name}`\n"
        f"| Column | MySQL Type |\n"
        f"|--------|------------|\n"
        f"{col_rows}\n\n"
        f"Row count: ~{len(df)}\n\n"
        f"### Sample values per column\n{sample_values_text}\n"
    )

    # 6. Optionally append an LLM-generated human description
    try:
        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": CSV_SCHEMA_DESCRIPTION_PROMPT.format(
                        table_name=table_name,
                        column_definitions=col_defs_text,
                        sample_rows=sample_rows_text,
                    ),
                }
            ],
            "temperature": 0.3,
            "max_tokens": 256,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers=_or_headers(),
                json=payload,
            )
            resp.raise_for_status()
            llm_description = resp.json()["choices"][0]["message"]["content"].strip()
            structured_schema += f"\n### Description\n{llm_description}\n"
    except Exception:
        pass  # structured_schema already has all the info needed

    return UploadResponse(
        success=True,
        table_name=table_name,
        schema_description=structured_schema,
        row_count=len(df),
        columns=columns_info,
    )
