"""
QueryMind FastAPI application entry point.

Run with:
    uvicorn main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import close_db, init_db
from routers.auth_router import router as auth_router
from routers.query_router import router as query_router
from routers.schema_router import router as schema_router
from routers.upload_router import router as upload_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("QueryMind API ready — model: %s", settings.OPENROUTER_MODEL)
    yield
    await close_db()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="QueryMind API",
    description="Conversational BI Dashboard backend — NexaMart edition",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api/auth")
app.include_router(query_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(schema_router, prefix="/api")
