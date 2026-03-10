import { useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { Copy, Download, BarChart2, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import type { Chart } from '@/types'
import { CHART_COLORS } from '@/data/mockData'

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
}

export default function ChartCard({ chart, animationDelay = 0 }: ChartCardProps) {
  const typeInfo = chartTypeLabels[chart.chart_type] || chartTypeLabels.bar
  const Icon = typeInfo.icon

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
      className="bg-[#16162a] border border-[#1e1e35] rounded-2xl p-5 hover:border-[#6366f1]/30 transition-all duration-300"
      style={{ animation: `fadeInUp 0.5s ease-out ${animationDelay}ms both` }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-1 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[#e2e8f0] text-sm leading-snug">{chart.title}</h3>
          </div>
          <p className="text-xs text-[#94a3b8] leading-relaxed">{chart.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="secondary" className="hidden sm:inline-flex text-xs gap-1">
            <Icon className="w-3 h-3" />
            {typeInfo.label}
          </Badge>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-3">
        {renderChart()}
      </div>
    </div>
  )
}
