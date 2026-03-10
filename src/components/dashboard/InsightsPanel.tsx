import { Sparkles } from 'lucide-react'

interface InsightsPanelProps {
  insights: string[]
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="bg-[#0f0f22] border border-[#1e1e35] rounded-2xl p-5 border-l-2 border-l-[#6366f1]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#6366f1]" />
        <h3 className="font-semibold text-[#e2e8f0] text-sm shimmer-text">✦ AI Insights</h3>
      </div>
      <ul className="space-y-2.5">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[#94a3b8] leading-relaxed"
            style={{ animation: `fadeInUp 0.4s ease-out ${i * 80}ms both` }}>
            <span className="flex-shrink-0 mt-0.5 text-base leading-none">{insight.split(' ')[0]}</span>
            <span>{insight.slice(insight.indexOf(' ') + 1)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
