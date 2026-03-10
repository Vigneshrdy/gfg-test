"""
Async MySQL connection pool via aiomysql.
All database interaction goes through the helpers in this module.
"""

import logging
from typing import Any

import aiomysql

from config import settings

logger = logging.getLogger(__name__)

_pool: aiomysql.Pool | None = None

# ── Lifecycle ─────────────────────────────────────────────────────────────────
async def init_db() -> None:
    global _pool
    _pool = await aiomysql.create_pool(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        db=settings.DB_NAME,
        charset="utf8mb4",
        autocommit=True,
        minsize=2,
        maxsize=20,
        cursorclass=aiomysql.DictCursor,
    )
    logger.info("MySQL connection pool initialised (%s@%s/%s)", settings.DB_USER, settings.DB_HOST, settings.DB_NAME)


async def close_db() -> None:
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None
        logger.info("MySQL connection pool closed")


# ── Read ──────────────────────────────────────────────────────────────────────
async def execute_read(sql: str, params: tuple = ()) -> list[dict]:
    """Parameterised SELECT — safe for application use."""
    async with _pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(sql, params)
            return list(await cur.fetchall())


# ── Write ─────────────────────────────────────────────────────────────────────
async def execute_write(sql: str, params: tuple = ()) -> int:
    """Parameterised INSERT / UPDATE / DELETE. Returns affected row count."""
    async with _pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(sql, params)
            await conn.commit()
            return cur.rowcount


# ── LLM-generated SQL (SELECT only) ──────────────────────────────────────────
_FORBIDDEN_PREFIXES = (
    "DROP", "DELETE", "TRUNCATE", "ALTER", "CREATE",
    "INSERT", "UPDATE", "GRANT", "REVOKE", "CALL", "EXEC",
)


async def execute_llm_sql(sql: str) -> list[dict]:
    """
    Execute an LLM-generated SQL string with extra safeguards:
    - Only SELECT / WITH … SELECT allowed
    - 30-second server-side timeout
    - 500-row cap enforced at application level
    """
    cleaned = sql.strip()
    upper = cleaned.upper().lstrip()

    for prefix in _FORBIDDEN_PREFIXES:
        if upper.startswith(prefix):
            raise ValueError(f"Disallowed SQL operation '{prefix}'. Only SELECT is permitted.")

    if not (upper.startswith("SELECT") or upper.startswith("WITH")):
        raise ValueError("LLM-generated SQL must be a SELECT or CTE query.")

    async with _pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # MySQL statement execution timeout (ms)
            await cur.execute("SET SESSION MAX_EXECUTION_TIME = 30000")
            await cur.execute(cleaned)
            rows = list(await cur.fetchmany(500))
            return rows


# ── DDL helpers for CSV uploads ───────────────────────────────────────────────
async def create_table_ddl(ddl: str) -> None:
    async with _pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(ddl)
            await conn.commit()


async def drop_table(table_name: str) -> None:
    async with _pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(f"DROP TABLE IF EXISTS `{table_name}`")
            await conn.commit()


async def bulk_insert(table: str, columns: list[str], rows: list[tuple]) -> None:
    cols_sql = ", ".join(f"`{c}`" for c in columns)
    placeholders = ", ".join(["%s"] * len(columns))
    sql = f"INSERT INTO `{table}` ({cols_sql}) VALUES ({placeholders})"
    async with _pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.executemany(sql, rows)
            await conn.commit()


# ── Schema introspection ──────────────────────────────────────────────────────
async def get_live_schema() -> list[dict[str, Any]]:
    """Return list of {name, row_count, columns:[{name,type,nullable}]} for all user tables."""
    tables_q = """
        SELECT TABLE_NAME AS name,
               TABLE_ROWS  AS row_count
        FROM   information_schema.TABLES
        WHERE  TABLE_SCHEMA = %s
          AND  TABLE_TYPE   = 'BASE TABLE'
        ORDER  BY TABLE_NAME
    """
    tables = await execute_read(tables_q, (settings.DB_NAME,))

    result = []
    for tbl in tables:
        cols_q = """
            SELECT COLUMN_NAME  AS name,
                   COLUMN_TYPE  AS type,
                   IS_NULLABLE  AS nullable
            FROM   information_schema.COLUMNS
            WHERE  TABLE_SCHEMA = %s AND TABLE_NAME = %s
            ORDER  BY ORDINAL_POSITION
        """
        cols = await execute_read(cols_q, (settings.DB_NAME, tbl["name"]))
        result.append(
            {
                "name": tbl["name"],
                "row_count": tbl["row_count"] or 0,
                "columns": [
                    {
                        "name": c["name"],
                        "type": c["type"],
                        "nullable": c["nullable"] == "YES",
                    }
                    for c in cols
                ],
            }
        )
    return result
