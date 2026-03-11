from pydantic import BaseModel, Field
from typing import Optional


# ── Auth models ────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str


# ── Query models ───────────────────────────────────────────────
class ConversationMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    conversation_history: list[ConversationMessage] = []
    uploaded_schema: Optional[str] = None  # injected when CSV was uploaded
    plan: str = "free"  # "free" | "pro"


class ChartConfig(BaseModel):
    xKey: str
    yKey: str
    colorBy: Optional[str] = None
    colors: list[str] = []


class Chart(BaseModel):
    chart_id: str
    chart_type: str  # line | bar | pie | area | scatter | table
    title: str
    description: str
    data: list[dict]
    config: ChartConfig


class Anomaly(BaseModel):
    point_label: str
    metric: str
    message: str
    severity: str = "warning"  # "warning" | "critical"


class QueryResponse(BaseModel):
    success: bool
    conversation_id: str
    sql_generated: Optional[str] = None
    charts: list[Chart] = []
    insights: list[str] = []
    follow_up_suggestions: list[str] = []
    generated_in: Optional[float] = None
    error: Optional[str] = None
    error_reason: Optional[str] = None
    suggestions: Optional[list[str]] = None
    confidence_score: Optional[int] = None
    confidence_label: Optional[str] = None
    anomalies: list[Anomaly] = []
    featured_chart_id: Optional[str] = None


class ExplainChartRequest(BaseModel):
    chart_title: str
    chart_type: str
    chart_description: str
    data_sample: list[dict]
    original_query: str


# ── CSV upload models ──────────────────────────────────────────
class ColumnInfo(BaseModel):
    name: str
    mysql_type: str
    sample_values: list


class UploadResponse(BaseModel):
    success: bool
    table_name: str
    schema_description: str
    row_count: int
    columns: list[ColumnInfo]


# ── Schema models ──────────────────────────────────────────────
class TableColumn(BaseModel):
    name: str
    type: str
    nullable: bool


class TableInfo(BaseModel):
    name: str
    row_count: int
    columns: list[TableColumn]


class SchemaResponse(BaseModel):
    tables: list[TableInfo]
    schema_string: str
