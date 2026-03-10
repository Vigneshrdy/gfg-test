import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2, Clock, Trash2, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { timeAgo, truncate } from '@/lib/utils'
import type { QuerySession } from '@/types'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<QuerySession[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = 'QueryMind — History'
    try {
      const saved = localStorage.getItem('querymind_sessions')
      if (saved) setSessions(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const filtered = sessions.filter(s =>
    s.query.toLowerCase().includes(search.toLowerCase())
  )

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    try { localStorage.setItem('querymind_sessions', JSON.stringify(updated)) } catch { /* ignore */ }
  }

  const clearAll = () => {
    setSessions([])
    try { localStorage.removeItem('querymind_sessions') } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-[#08080f]">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[#1e1e35] bg-[#08080f]/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="font-display font-bold text-[#e2e8f0]">Query History</span>
        </div>
        {sessions.length > 0 && (
          <Button variant="ghost" onClick={clearAll} className="text-[#ef4444] hover:text-[#ef4444] text-xs gap-2">
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </Button>
        )}
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {sessions.length > 0 && (
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a6a]" />
            <Input
              placeholder="Search queries..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-[#6366f1]" />
            </div>
            <h3 className="font-display font-bold text-[#e2e8f0] text-xl mb-2">
              {search ? 'No matching queries' : 'No history yet'}
            </h3>
            <p className="text-[#94a3b8] text-sm mb-6">
              {search ? 'Try a different search term.' : 'Your dashboard queries will appear here.'}
            </p>
            {!search && (
              <Button onClick={() => navigate('/dashboard')} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Start querying
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#4a4a6a] font-mono mb-4">{filtered.length} queries</p>
            {filtered.map(s => (
              <div
                key={s.id}
                className="glass-card glass-card-hover rounded-xl p-4 border border-[#1e1e35] group flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart2 className="w-4 h-4 text-[#6366f1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#e2e8f0] text-sm font-medium mb-1.5 leading-snug">{s.query}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#4a4a6a] font-mono">{timeAgo(s.timestamp)}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{s.chartCount} charts</Badge>
                    {s.response?.success && <Badge variant="success" className="text-[10px] py-0 px-1.5">Success</Badge>}
                  </div>
                  {s.response?.insights && s.response.insights.length > 0 && (
                    <p className="text-xs text-[#4a4a6a] mt-2 leading-snug">{truncate(s.response.insights[0], 80)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate('/dashboard')}>
                    Open
                  </Button>
                  <button
                    onClick={() => deleteSession(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#4a4a6a] hover:text-[#ef4444] transition-all p-1.5 rounded-lg hover:bg-[#ef4444]/10 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
