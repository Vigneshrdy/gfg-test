import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSharedDashboard } from '@/lib/api'
import ChartCard from '@/components/dashboard/ChartCard'
import InsightsPanel from '@/components/dashboard/InsightsPanel'
import { Sparkles, ExternalLink, AlertCircle } from 'lucide-react'
import type { Chart } from '@/types/index'

interface SharedPayload {
  query: string
  charts: Chart[]
  insights: string[]
  follow_up_suggestions: string[]
  confidence_score?: number
  confidence_label?: string
}

export default function SharedDashboardPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const [data, setData] = useState<SharedPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shareId) return
    getSharedDashboard(shareId)
      .then(d => setData(d as unknown as SharedPayload))
      .catch(() => setError('This shared dashboard could not be found or has expired.'))
      .finally(() => setLoading(false))
  }, [shareId])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-void)', color: 'var(--text-primary)', fontFamily: 'var(--font-base)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-6 border-b"
        style={{ background: 'var(--bg-base)', borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-base)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-base)]" />
          </span>
          <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent-base)' }}>QueryMind</span>
          <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent-base)', border: '1px solid var(--border-accent)' }}>
            Shared Dashboard
          </span>
        </div>
        <Link to="/" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{ background: 'var(--accent-base)', color: 'var(--text-inverse)' }}>
          <ExternalLink className="w-3.5 h-3.5" />
          Open QueryMind
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-base)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="w-10 h-10" style={{ color: 'var(--negative)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-base)' }} />
              </div>
              <div>
                <blockquote className="font-mono font-semibold text-base border-l-2 pl-3 leading-snug"
                  style={{ borderColor: 'var(--accent-base)', color: 'var(--text-primary)' }}>
                  {data.query}
                </blockquote>
                {data.confidence_score != null && (
                  <span className={`mt-1 inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    data.confidence_score >= 80
                      ? 'text-[#10b981] border-[#10b981]/30 bg-[#10b981]/10'
                      : data.confidence_score >= 50
                      ? 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10'
                      : 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10'
                  }`}>
                    {data.confidence_score}% — {data.confidence_label}
                  </span>
                )}
              </div>
            </div>

            {data.charts && data.charts.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {data.charts.map((chart, i) => (
                  <ChartCard
                    key={chart.chart_id || i}
                    chart={chart}
                    animationDelay={i * 150}
                    isFeatured={i === 0}
                  />
                ))}
              </div>
            )}

            {data.insights && data.insights.length > 0 && (
              <InsightsPanel insights={data.insights} />
            )}

            {data.follow_up_suggestions && data.follow_up_suggestions.length > 0 && (
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-faint)' }}>
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Suggested follow-ups
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.follow_up_suggestions.map(s => (
                    <Link key={s} to={`/?q=${encodeURIComponent(s)}`}
                      className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                      style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                      → {s}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <Link to="/signup" className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-lg"
                style={{ background: 'var(--accent-base)', color: 'var(--text-inverse)' }}>
                <Sparkles className="w-4 h-4" />
                Build your own dashboard with QueryMind →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
