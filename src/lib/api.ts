import type { DashboardResponse, UploadResponse, SchemaResponse, Message } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// JWT token stored by AuthContext on login
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('querymind_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}

export async function queryDashboard(
  query: string,
  conversationHistory: Message[] = [],
  uploadedSchema?: string
): Promise<DashboardResponse> {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      query,
      conversation_history: conversationHistory,
      uploaded_schema: uploadedSchema,
    }),
  })
  return handleResponse<DashboardResponse>(res)
}

export async function uploadCSV(file: File): Promise<UploadResponse> {
  const token = localStorage.getItem('querymind_token')
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/api/upload-csv`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

  // Backend returns UploadResponse with `columns` array; map to frontend shape
  const data = await res.json()
  return {
    success: data.success,
    table_name: data.table_name,
    schema_description: data.schema_description ?? '',
    schema: (data.columns ?? []).map((c: { name: string; mysql_type: string }) => ({
      name: c.name,
      type: mysqlTypeToFrontend(c.mysql_type),
    })),
    preview: [],
    row_count: data.row_count,
  }
}

function mysqlTypeToFrontend(t: string): 'text' | 'number' | 'date' | 'boolean' {
  const u = t.toUpperCase()
  if (u.includes('INT') || u.includes('FLOAT') || u.includes('DOUBLE') || u.includes('DECIMAL')) return 'number'
  if (u.includes('DATE') || u.includes('TIME')) return 'date'
  if (u.includes('TINYINT(1)') || u === 'BOOL' || u === 'BOOLEAN') return 'boolean'
  return 'text'
}

export async function getSchema(): Promise<SchemaResponse> {
  const res = await fetch(`${API_BASE}/api/schema`, { headers: getAuthHeaders() })
  return handleResponse<SchemaResponse>(res)
}

export async function loginApi(
  email: string,
  password: string
): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(res)
}

export async function registerApi(
  email: string,
  password: string,
  full_name: string
): Promise<{ id: number; email: string; full_name: string; role: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  })
  return handleResponse(res)
}

export async function getMeApi(): Promise<{ id: number; email: string; full_name: string; role: string }> {
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers: getAuthHeaders() })
  return handleResponse(res)
}

export async function explainChart(
  chartTitle: string,
  chartType: string,
  chartDescription: string,
  dataSample: Record<string, unknown>[],
  originalQuery: string,
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/explain-chart`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      chart_title: chartTitle,
      chart_type: chartType,
      chart_description: chartDescription,
      data_sample: dataSample,
      original_query: originalQuery,
    }),
  })
  const data = await handleResponse<{ explanation: string }>(res)
  return data.explanation
}

export async function shareDashboard(payload: {
  query: string
  charts_data: Record<string, unknown>[]
  insights: string[]
  follow_up_suggestions: string[]
  confidence_score?: number
  confidence_label?: string
}): Promise<{ share_id: string; url: string }> {
  const res = await fetch(`${API_BASE}/api/share`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse(res)
}

export async function getSharedDashboard(shareId: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/api/share/${encodeURIComponent(shareId)}`)
  return handleResponse(res)
}

export async function getExecutiveSummary(
  query: string,
  insights: string[],
  chartsData: Record<string, unknown>[],
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/executive-summary`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, insights, charts_data: chartsData }),
  })
  const data = await handleResponse<{ summary: string }>(res)
  return data.summary
}
