import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu, X, Sparkles, Database, Bell, Settings, LogOut, History,
  Upload, Plus, Trash2, ChevronDown, BarChart2, FileText, AlertCircle, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import QueryInput from '@/components/dashboard/QueryInput'
import LoadingState from '@/components/dashboard/LoadingState'
import ChartCard from '@/components/dashboard/ChartCard'
import InsightsPanel from '@/components/dashboard/InsightsPanel'
import SQLBlock from '@/components/dashboard/SQLBlock'
import CSVUploadModal from '@/components/dashboard/CSVUploadModal'
import { useAuth } from '@/contexts/AuthContext'
import { queryDashboard } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import type { DashboardResponse, QuerySession } from '@/types'
import { truncate, timeAgo } from '@/lib/utils'

const EXAMPLE_QUERIES = [
  'Monthly revenue by region for Q3 2024',
  'Top 10 products by profit margin',
  'Marketing channel ROI comparison',
  'Customer segment breakdown by acquisition channel',
  'Inventory items below reorder point',
  'Year-over-year sales growth by category',
]

// === Empty State ===
function EmptyState({ onQuerySelect }: { onQuerySelect: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center mx-auto mb-4 animate-float">
          <Sparkles className="w-8 h-8 text-[#6366f1]" />
        </div>
        <h2 className="font-display font-bold text-3xl text-[#e2e8f0] mb-3">What would you like to explore?</h2>
        <p className="text-[#94a3b8] max-w-md mx-auto text-sm leading-relaxed">
          Ask any business question in plain English and get an instant interactive dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {EXAMPLE_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => onQuerySelect(q)}
            className="glass-card glass-card-hover rounded-xl p-4 text-left cursor-pointer border border-[#1e1e35] hover:border-[#6366f1]/40 group transition-all"
          >
            <div className="flex items-start gap-2">
              <BarChart2 className="w-4 h-4 text-[#6366f1] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-[#94a3b8] group-hover:text-[#e2e8f0] transition-colors leading-snug">{q}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// === Error State ===  
function ErrorState({ error, suggestions, onRetry, onSuggestion }: {
  error: string; suggestions?: string[]
  onRetry: () => void; onSuggestion: (s: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-7 h-7 text-[#ef4444]" />
      </div>
      <h3 className="font-semibold text-[#e2e8f0] text-lg mb-2">Couldn't answer this question</h3>
      <p className="text-[#94a3b8] text-sm mb-6 max-w-md">{error}</p>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {suggestions.map(s => (
            <button key={s} onClick={() => onSuggestion(s)}
              className="px-3 py-2 text-xs border border-[#1e1e35] rounded-full text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#6366f1]/40 transition-all cursor-pointer">
              {s}
            </button>
          ))}
        </div>
      )}
      <Button variant="outline" onClick={onRetry}>Try Again</Button>
    </div>
  )
}

// === Dashboard Result Block ===
function DashboardResult({
  session, isLatest, onFollowUp
}: {
  session: QuerySession; isLatest: boolean; onFollowUp: (s: string) => void
}) {
  const [expanded, setExpanded] = useState(isLatest)
  const res = session.response

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-[#6366f1]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <blockquote className="text-[#e2e8f0] font-medium text-sm border-l-2 border-[#6366f1] pl-3 leading-snug">
              {session.query}
            </blockquote>
            {!isLatest && (
              <button onClick={() => setExpanded(e => !e)}
                className="text-xs text-[#4a4a6a] hover:text-[#94a3b8] transition-colors flex items-center gap-1 flex-shrink-0">
                {expanded ? 'Collapse' : 'Expand'}
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4a4a6a] font-mono">{timeAgo(session.timestamp)}</span>
            {res && <Badge variant="success" className="text-xs">Generated in {res.generated_in}s</Badge>}
          </div>
        </div>
      </div>

      {expanded && res && (
        <div className="ml-9 space-y-4">
          {res.sql_generated && (
            <SQLBlock sql={res.sql_generated} generatedIn={res.generated_in} />
          )}

          {res.charts && res.charts.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {res.charts.map((chart, i) => (
                <ChartCard key={chart.chart_id} chart={chart} animationDelay={i * 150} />
              ))}
            </div>
          )}

          {res.insights && res.insights.length > 0 && <InsightsPanel insights={res.insights} />}

          {res.follow_up_suggestions && res.follow_up_suggestions.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[#4a4a6a] font-mono">Continue exploring →</span>
              {res.follow_up_suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => onFollowUp(s)}
                  className="px-3 py-1.5 text-xs border border-[#1e1e35] rounded-full text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#6366f1]/40 hover:bg-[#16162a] transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [sessions, setSessions] = useState<QuerySession[]>([])
  const [csvSource, setCsvSource] = useState<string | null>(null)
  const [uploadedSchema, setUploadedSchema] = useState<string | null>(null)
  const [errorState, setErrorState] = useState<{ message: string; suggestions?: string[] } | null>(null)
  const lastQueryRef = useRef('')

  useEffect(() => { document.title = 'QueryMind — Dashboard' }, [])

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('querymind_sessions')
      if (saved) setSessions(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const saveSessions = useCallback((s: QuerySession[]) => {
    setSessions(s)
    try {
      localStorage.setItem('querymind_sessions', JSON.stringify(s.slice(0, 20)))
    } catch { /* ignore */ }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || loading) return
    const q = query.trim()
    lastQueryRef.current = q
    setQuery('')
    setLoading(true)
    setErrorState(null)

    try {
      const history = sessions.map(s => ({ role: 'user' as const, content: s.query }))
      const res: DashboardResponse = await queryDashboard(q, history, uploadedSchema ?? undefined)

      if (!res.success) {
        setErrorState({ message: res.error_reason || res.error || 'Query failed', suggestions: res.suggestions })
        setLoading(false)
        return
      }

      const newSession: QuerySession = {
        id: res.conversation_id || `session-${Date.now()}`,
        query: q,
        timestamp: new Date(),
        chartCount: res.charts?.length || 0,
        response: res,
      }
      saveSessions([newSession, ...sessions])
      setLoading(false)
      toast({ title: 'Dashboard ready!', description: `Generated ${res.charts?.length} charts.` })
    } catch (err) {
      setErrorState({ message: String(err) })
      setLoading(false)
    }
  }, [query, loading, sessions, saveSessions, uploadedSchema])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="h-screen flex flex-col bg-[#08080f] overflow-hidden">
      {/* === TOP NAVBAR === */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-[#1e1e35] bg-[#08080f]/95 backdrop-blur-xl flex-shrink-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(o => !o)} className="h-8 w-8">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366f1] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366f1]" />
            </span>
            <span className="font-display font-bold text-[#e2e8f0] hidden sm:block">QueryMind</span>
          </div>
          {sessions.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#4a4a6a]">
              <span>/</span>
              <span className="text-[#94a3b8]">{truncate(sessions[0]?.query || 'Dashboard', 30)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {csvSource ? (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#10b981] font-mono hidden sm:block truncate max-w-[120px]">{csvSource}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#10b981] font-mono hidden sm:block">NexaMart DB</span>
            </div>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-[#e2e8f0] hidden md:block">{userName.split(' ')[0]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal -mt-1 opacity-60">{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2"><Settings className="w-4 h-4" /> Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/history')} className="gap-2"><History className="w-4 h-4" /> Query History</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-[#ef4444] focus:text-[#ef4444]">
                <LogOut className="w-4 h-4" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* === SIDEBAR === */}
        <aside className={`sidebar-transition flex-shrink-0 border-r border-[#1e1e35] bg-[#0b0b18] flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
          <div className="p-3 flex-shrink-0">
            <Button
              className="w-full gap-2 justify-start"
              onClick={() => { setSessions([]); setQuery(''); setErrorState(null) }}
            >
              <Plus className="w-4 h-4" />
              New Dashboard
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3">
            {sessions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#4a4a6a] font-mono uppercase tracking-widest mb-2 px-1">Recent</p>
                <div className="space-y-1">
                  {sessions.slice(0, 15).map(s => (
                    <div key={s.id}
                      className="group flex items-center gap-2 p-2.5 rounded-lg hover:bg-[#16162a] transition-colors cursor-pointer">
                      <BarChart2 className="w-3.5 h-3.5 text-[#4a4a6a] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#94a3b8] truncate">{truncate(s.query, 38)}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#4a4a6a] font-mono">{timeAgo(s.timestamp)}</span>
                          <Badge variant="secondary" className="text-[10px] py-0 px-1">{s.chartCount} charts</Badge>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); saveSessions(sessions.filter(x => x.id !== s.id)) }}
                        className="opacity-0 group-hover:opacity-100 text-[#4a4a6a] hover:text-[#ef4444] transition-all flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-[#4a4a6a] font-mono uppercase tracking-widest mb-2 px-1">Quick Actions</p>
              <div className="space-y-1">
                <button onClick={() => setCsvModalOpen(true)}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-[#94a3b8] hover:bg-[#16162a] hover:text-[#e2e8f0] transition-colors text-sm cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#6366f1]" />
                  Upload CSV
                </button>
                <button onClick={() => navigate('/dashboard/history')}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-[#94a3b8] hover:bg-[#16162a] hover:text-[#e2e8f0] transition-colors text-sm cursor-pointer">
                  <History className="w-3.5 h-3.5 text-[#6366f1]" />
                  View History
                </button>
              </div>
            </div>
          </ScrollArea>

          {/* User info card */}
          <div className="p-3 border-t border-[#1e1e35] flex-shrink-0">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#16162a]">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#e2e8f0] truncate">{userName}</p>
                <Badge variant="default" className="text-[10px] py-0 px-1.5">Pro</Badge>
              </div>
              <button className="text-[#4a4a6a] hover:text-[#94a3b8] transition-colors">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Query input always at top */}
          <div className="flex-shrink-0 p-4 pb-0 border-b border-[#1e1e35] bg-[#08080f]/80 backdrop-blur-sm">
            <QueryInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSubmit}
              disabled={loading}
              suggestions={sessions.length > 0 && sessions[0].response?.follow_up_suggestions
                ? sessions[0].response.follow_up_suggestions.slice(0, 3)
                : ['Show me Q3 revenue by region', 'Marketing ROI by channel', 'Product category breakdown']}
            />
            <div className="h-4" />
          </div>

          {/* Scrollable content area */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-8">
              {/* Loading state */}
              {loading && (
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-[#6366f1]" />
                    </div>
                    <blockquote className="text-[#e2e8f0] font-medium text-sm border-l-2 border-[#6366f1] pl-3">
                      {lastQueryRef.current}
                    </blockquote>
                  </div>
                  <div className="ml-9">
                    <LoadingState />
                  </div>
                </div>
              )}

              {/* Error state */}
              {errorState && !loading && (
                <ErrorState
                  error={errorState.message}
                  suggestions={errorState.suggestions}
                  onRetry={() => { setQuery(lastQueryRef.current); setErrorState(null) }}
                  onSuggestion={s => { setQuery(s); setErrorState(null) }}
                />
              )}

              {/* Sessions */}
              {!loading && !errorState && sessions.length > 0 && (
                <div className="space-y-8">
                  {sessions.map((session, i) => (
                    <div key={session.id}>
                      <DashboardResult
                        session={session}
                        isLatest={i === 0}
                        onFollowUp={s => setQuery(s)}
                      />
                      {i < sessions.length - 1 && <Separator className="mt-8" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && !errorState && sessions.length === 0 && (
                <EmptyState onQuerySelect={q => { setQuery(q); setTimeout(handleSubmit, 100) }} />
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      <CSVUploadModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onSuccess={(name, _schema, tableName, schemaDescription) => {
          setCsvSource(`📄 ${name}`)
          setUploadedSchema(schemaDescription || null)
          setCsvModalOpen(false)
        }}
      />
    </div>
  )
}
