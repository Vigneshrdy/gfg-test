export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table'

export interface ChartDataPoint {
  [key: string]: string | number
}

export interface ChartConfig {
  xKey: string
  yKey: string | string[]
  colorBy?: string
  colors: string[]
}

export interface Chart {
  chart_id: string
  chart_type: ChartType
  title: string
  description: string
  data: ChartDataPoint[]
  config: ChartConfig
}

export interface Anomaly {
  point_label: string
  metric: string
  message: string
  severity: 'warning' | 'critical'
}

export interface DashboardResponse {
  success: boolean
  sql_generated?: string
  charts: Chart[]
  insights: string[]
  follow_up_suggestions: string[]
  conversation_id?: string
  generated_in?: number
  error?: string
  error_reason?: string
  suggestions?: string[]
  confidence_score?: number
  confidence_label?: string
  anomalies?: Anomaly[]
  featured_chart_id?: string
}

export interface UploadResponse {
  success: boolean
  table_name: string
  schema_description?: string
  schema: SchemaColumn[]
  preview: Record<string, string | number>[]
  row_count: number
}

export interface SchemaColumn {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean'
}

export interface SchemaResponse {
  tables: {
    name: string
    columns: SchemaColumn[]
  }[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export interface QuerySession {
  id: string
  query: string
  timestamp: Date
  chartCount: number
  response?: DashboardResponse
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  plan: 'free' | 'pro' | 'enterprise'
  avatar_url?: string
}
