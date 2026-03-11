import { useState, useCallback, useRef } from 'react'
import html2canvas from 'html2canvas'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { Copy, Download, BarChart2, TrendingUp, PieChart as PieIcon, Activity, ImageDown, Sparkles, X, AlertTriangle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import type { Chart, Anomaly } from '@/types'
import { CHART_COLORS } from '@/data/mockData'
import { explainChart } from '@/lib/api'

// === Custom Tooltip ===
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl border border-[#1e1e35] p-3 min-w-[140px] shadow-2xl">
      <p className="text-[#94a3b8] text-xs font-mono mb-2 border-b border-[#1e1e35] pb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-xs text-[#94a3b8] capitalize">{p.dataKey || p.name}</span>
          </div>
          <span className="text-xs font-mono text-[#e2e8f0] font-medium">
            {typeof p.value === 'number' && p.value > 1000
              ? `$${(p.value / 1000).toFixed(1)}K`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl border border-[#1e1e35] p-3 shadow-2xl">
      <p className="text-xs font-mono text-[#e2e8f0]">{payload[0].name}</p>
      <p className="text-xs text-[#94a3b8] font-mono mt-1">{payload[0].value}%</p>
    </div>
  )
}

// === Chart Renderers ===
function renderLineChart(chart: Chart) {
  const yKeys = Array.isArray(chart.config.yKey) ? chart.config.yKey : [chart.config.yKey]
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chart.data}>
        <defs>
          {yKeys.map((k, i) => (
            <linearGradient key={k} id={`lineGrad-${chart.chart_id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[i]} stopOpacity={0.15} />
              <stop offset="95%" stopColor={CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
        <XAxis dataKey={chart.config.xKey} tick={{ fill: '#4a4a6a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#4a4a6a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={55} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono' }} />
        {yKeys.map((k, i) => (
          <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: CHART_COLORS[i % CHART_COLORS.length] }}
            isAnimationActive />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function renderAreaChart(chart: Chart) {
  const yKeys = Array.isArray(chart.config.yKey) ? chart.config.yKey : [chart.config.yKey]
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chart.data}>
        <defs>
          {yKeys.map((k, i) => (
            <linearGradient key={k} id={`areaGrad-${chart.chart_id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[i]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
        <XAxis dataKey={chart.config.xKey} tick={{ fill: '#4a4a6a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#4a4a6a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={55} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono' }} />
        {yKeys.map((k, i) => (
          <Area key={k} type="monotone" dataKey={k}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fill={`url(#areaGrad-${chart.chart_id}-${i})`}
            strokeWidth={2} isAnimationActive />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function renderBarChart(chart: Chart) {
  const yKeys = Array.isArray(chart.config.yKey) ? chart.config.yKey : [chart.config.yKey]
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e35" />
        <XAxis dataKey={chart.config.xKey} tick={{ fill: '#4a4a6a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#4a4a6a', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={55} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono' }} />
        {yKeys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} isAnimationActive />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function renderPieChart(chart: Chart) {
  const RADIAN = Math.PI / 180
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.3
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontFamily="DM Mono">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chart.data}
          cx="50%" cy="50%"
          innerRadius={65} outerRadius={105}
          dataKey={typeof chart.config.yKey === 'string' ? chart.config.yKey : chart.config.yKey[0]}
          nameKey={chart.config.xKey}
          labelLine={false}
          label={renderLabel}
          isAnimationActive
        >
          {chart.data.map((_entry, i) => (
            <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

const chartTypeLabels: Record<string, { label: string; icon: React.ElementType }> = {
  line: { label: 'Line Chart', icon: TrendingUp },
  bar: { label: 'Bar Chart', icon: BarChart2 },
  pie: { label: 'Pie Chart', icon: PieIcon },
  area: { label: 'Area Chart', icon: Activity },
}

interface ChartCardProps {
  chart: Chart
  animationDelay?: number
  isFeatured?: boolean
  anomalies?: Anomaly[]
  originalQuery?: string
}

export default function ChartCard({ chart, animationDelay = 0, isFeatured = false, anomalies = [], originalQuery = '' }: ChartCardProps) {
  const typeInfo = chartTypeLabels[chart.chart_type] || chartTypeLabels.bar
  const Icon = typeInfo.icon
  const cardRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [showExplain, setShowExplain] = useState(false)

  const chartAnomalies = anomalies.filter(a =>
    chart.data.some(row => String(Object.values(row)[0]) === a.point_label || a.metric in row)
  )

  const handleExport = useCallback(async () => {
    const container = cardRef.current
    if (!container) return
    setExporting(true)
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#131920',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${chart.title.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: 'Chart exported!', description: `${chart.title}.png saved.` })
    } catch (err) {
      toast({ title: 'Export failed', description: String(err), variant: 'destructive' })
    } finally {
      setExporting(false)
    }
  }, [chart.title])

  const handleExplain = useCallback(async () => {
    setShowExplain(true)
    if (explanation) return
    setExplaining(true)
    try {
      const text = await explainChart(
        chart.title,
        chart.chart_type,
        chart.description,
        chart.data.slice(0, 20) as Record<string, unknown>[],
        originalQuery,
      )
      setExplanation(text)
    } catch {
      setExplanation('Unable to generate explanation at this time.')
    } finally {
      setExplaining(false)
    }
  }, [chart, originalQuery, explanation])

  const renderChart = () => {
    switch (chart.chart_type) {
      case 'line': return renderLineChart(chart)
      case 'bar': return renderBarChart(chart)
      case 'pie': return renderPieChart(chart)
      case 'area': return renderAreaChart(chart)
      default: return renderBarChart(chart)
    }
  }

  return (
    <div
      ref={cardRef}
      className={`bg-[#131920] border rounded-2xl p-5 transition-all duration-300 ${isFeatured ? 'border-[#2DD4BF]/50 shadow-[0_0_20px_rgba(45,212,191,0.08)]' : 'border-[#1C2730] hover:border-[#2DD4BF]/30'}`}
      style={{ animation: `fadeInUp 0.5s ease-out ${animationDelay}ms both` }}
    >
      {/* Featured label */}
      {isFeatured && (
        <div className="flex items-center gap-1.5 mb-3">
          <Star className="w-3 h-3 text-[#2DD4BF] fill-[#2DD4BF]" />
          <span className="text-[10px] font-mono font-semibold text-[#2DD4BF] uppercase tracking-widest">Best Match</span>
        </div>
      )}

      {/* Card header */}
      <div className="flex items-start justify-between mb-1 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-mono font-semibold text-[#E8EDF2] text-sm leading-snug">{chart.title}</h3>
          </div>
          <p className="text-xs text-[#8FA3B8] leading-relaxed font-mono">{chart.description}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge variant="secondary" className="hidden sm:inline-flex text-xs gap-1 font-mono">
            <Icon className="w-3 h-3" />
            {typeInfo.label}
          </Badge>
          <button
            onClick={handleExplain}
            title="Explain this chart"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#4F6478] hover:text-[#2DD4BF] hover:bg-[#0F3D38] transition-colors text-xs font-mono"
          >
            <Sparkles className="w-3 h-3" />
            Explain
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            title="Export as PNG"
            className="p-1.5 rounded-lg text-[#4F6478] hover:text-[#2DD4BF] hover:bg-[#0F3D38] transition-colors disabled:opacity-40"
          >
            <ImageDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-3">
        {renderChart()}
      </div>

      {/* Anomaly callouts */}
      {chartAnomalies.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {chartAnomalies.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-mono ${a.severity === 'critical' ? 'bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444]' : 'bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b]'}`}>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Explain panel */}
      {showExplain && (
        <div className="mt-4 rounded-xl bg-[#0D1117] border border-[#2DD4BF]/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span className="text-xs font-mono font-semibold text-[#2DD4BF] uppercase tracking-widest">Chart Explanation</span>
            </div>
            <button onClick={() => setShowExplain(false)} className="text-[#4F6478] hover:text-[#94a3b8] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {explaining ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-3 h-3 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span className="text-xs text-[#4F6478] font-mono">Analyzing chart data...</span>
            </div>
          ) : (
            <p className="text-xs text-[#94a3b8] leading-relaxed font-mono">{explanation}</p>
          )}
        </div>
      )}
    </div>
  )
}
