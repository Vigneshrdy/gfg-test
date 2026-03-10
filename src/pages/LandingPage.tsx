import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, BarChart2, Brain, Upload, MessageSquare, Share2,
  Play, ChevronRight, Check, Github, Twitter, Linkedin, Zap
} from 'lucide-react'
import {
  ContainerScroll,
  ContainerStagger,
  ContainerAnimated,
  ContainerInset,
} from '@/components/blocks/hero-video'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BentoPricing } from '@/components/ui/bento-pricing'
import { useAuth } from '@/contexts/AuthContext'
import { mockRevenueLineData, mockCategoryBarData, mockSegmentPieData, CHART_COLORS } from '@/data/mockData'

// === NAVBAR ===
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Demo', href: '#demo' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080B0E]/95 backdrop-blur-xl border-b border-[#1C2730]' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — goes to dashboard if logged in, else landing */}
          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2DD4BF]" />
            </span>
            <span className="font-mono font-bold text-xl text-[#E8EDF2] tracking-tight">QueryMind</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={e => {
                  e.preventDefault()
                  const el = document.querySelector(href)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="text-sm text-[#8FA3B8] hover:text-[#E8EDF2] transition-colors cursor-pointer font-mono"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button
                  size="sm"
                  style={{ background: 'linear-gradient(135deg, #2DD4BF 0%, #1A9E8F 100%)' }}
                  className="text-[#080B0E] font-semibold hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-[#8FA3B8] hover:text-[#E8EDF2]">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    style={{ background: 'linear-gradient(135deg, #2DD4BF 0%, #1A9E8F 100%)' }}
                    className="text-[#080B0E] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// === HERO SECTION (scroll-reveal animated) ===
function HeroSection() {
  return (
    <ContainerScroll
      className="overflow-x-hidden text-center"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(45,212,191,0.10) 0%, #080B0E 60%)',
      }}
    >
      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 hero-grid-bg opacity-50" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#2DD4BF]/4 blur-[120px] animate-blob-move" />

      {/* Text + CTA block */}
      <ContainerStagger
        className="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-16"
        transition={{ staggerChildren: 0.14 }}
      >
        {/* Eyebrow */}
        <ContainerAnimated animation="top">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/8 px-4 py-2 text-sm font-medium text-[#5EEAD4]">
            <Sparkles className="h-4 w-4" />
            Powered by OpenRouter · Real-time NexaMart Data
          </div>
        </ContainerAnimated>

        {/* Headline */}
        <ContainerAnimated animation="top">
          <h1 className="mb-6 font-mono font-black leading-[1.05] text-[clamp(40px,7vw,76px)] tracking-tight text-[#E8EDF2]">
            Ask Your Data
            <br />
            <span className="animate-[gradientShift_4s_ease_infinite] bg-[length:200%] bg-gradient-to-r from-[#2DD4BF] via-[#5EEAD4] to-[#2DD4BF] bg-clip-text text-transparent">
              Anything.
            </span>
          </h1>
        </ContainerAnimated>

        {/* Sub-headline */}
        <ContainerAnimated animation="blur">
          <p className="mx-auto mb-10 max-w-xl text-xl leading-relaxed text-[#8FA3B8]">
            QueryMind turns plain English into live, interactive business dashboards—backed
            by real MySQL data and AI intelligence.
          </p>
        </ContainerAnimated>

        {/* CTAs */}
        <ContainerAnimated animation="blur" className="mb-12 flex flex-wrap justify-center gap-3">
          <Link to="/signup">
            <Button
              size="lg"
              style={{ background: 'linear-gradient(135deg, #2DD4BF 0%, #1A9E8F 100%)' }}
              className="group rounded-full text-[#080B0E] font-semibold hover:opacity-90 transition-opacity shadow-accent"
            >
              Start For Free
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full gap-2 border-[#253040] hover:border-[#2DD4BF]/40 text-[#8FA3B8] hover:text-[#E8EDF2]"
            >
              <Play className="h-4 w-4 fill-current text-[#2DD4BF]" />
              See Live Demo
            </Button>
          </Link>
        </ContainerAnimated>

        {/* Stats strip */}
        <ContainerAnimated
          animation="bottom"
          className="flex flex-wrap justify-center gap-10"
        >
          {[
            { val: '< 5 s', label: 'Query to dashboard' },
            { val: '500+', label: 'NexaMart customers' },
            { val: 'GPT-4o', label: 'LLM backbone' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-jetbrains text-xl font-bold text-[#2DD4BF]">{s.val}</p>
              <p className="mt-0.5 text-xs text-[#4F6478]">{s.label}</p>
            </div>
          ))}
        </ContainerAnimated>
      </ContainerStagger>

      {/* Dashboard preview — expands pill → full-bleed on scroll */}
      <ContainerInset
        className="mx-6 md:mx-16"
        insetXRange={[36, 0]}
        insetYRange={[26, 0]}
        roundednessRange={[900, 16]}
      >
        <div className="min-h-[540px] w-full bg-[#080B0E]">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 border-b border-[#1C2730] bg-[#0D1117] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#F87171]/70" />
              <div className="h-3 w-3 rounded-full bg-[#FBBF24]/70" />
              <div className="h-3 w-3 rounded-full bg-[#34D399]/70" />
            </div>
            <div className="flex h-6 flex-1 items-center rounded-md bg-[#131920] px-3">
              <span className="font-jetbrains text-xs text-[#4F6478]">app.querymind.ai/dashboard</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Query bar */}
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#2DD4BF]/30 bg-[#131920] p-3">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-[#2DD4BF]" />
              <span className="font-jetbrains text-sm text-[#5EEAD4]">
                Show me monthly revenue by region for 2024
              </span>
              <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg bg-[#2DD4BF]">
                <Zap className="h-3 w-3 text-[#080B0E]" />
              </div>
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card col-span-2 rounded-xl p-4">
                <p className="mb-3 text-xs font-semibold text-[#8FA3B8]">Monthly Revenue by Region (2024)</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={mockRevenueLineData.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C2730" />
                    <XAxis dataKey="month" tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1A232D', border: '1px solid #344558', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
                    {['north', 'south', 'east', 'west'].map((k, i) => (
                      <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card rounded-xl p-4">
                <p className="mb-3 text-xs font-semibold text-[#8FA3B8]">Customer Segments</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={mockSegmentPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value">
                      {mockSegmentPieData.map((_e, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ background: '#1A232D', border: '1px solid #344558', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card col-span-3 rounded-xl p-4">
                <p className="mb-3 text-xs font-semibold text-[#8FA3B8]">Revenue vs Profit — Product Categories</p>
                <ResponsiveContainer width="100%" height={115}>
                  <BarChart data={mockCategoryBarData.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C2730" />
                    <XAxis dataKey="category" tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1A232D', border: '1px solid #344558', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="revenue" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#34D399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPI strip */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Total Revenue', val: '$4.82M', change: '+19.4%', color: '#34D399' },
                { label: 'Active Orders', val: '12,840', change: '+34%', color: '#2DD4BF' },
                { label: 'Avg Order Value', val: '$374', change: '+8.2%', color: '#FBBF24' },
              ].map((m) => (
                <div key={m.label} className="glass-card rounded-lg p-3">
                  <p className="text-xs text-[#4F6478]">{m.label}</p>
                  <p className="font-jetbrains text-lg font-bold text-[#E8EDF2]">{m.val}</p>
                  <p className="font-jetbrains text-xs" style={{ color: m.color }}>↑ {m.change}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContainerInset>
    </ContainerScroll>
  )
}

// === DEMO / QUERY SIMULATION SECTION ===
const DEMO_QUERIES = [
  { q: 'Show me Q3 revenue by region', tag: 'Revenue' },
  { q: 'Which products have declining sales?', tag: 'Products' },
  { q: 'Top 10 customers by lifetime value', tag: 'Customers' },
  { q: 'Compare marketing ROI across channels', tag: 'Marketing' },
]

function DemoSection() {
  const [active, setActive] = useState(0)
  const [typed, setTyped] = useState('')
  const [stage, setStage] = useState<'typing' | 'result'>('typing')

  useEffect(() => {
    setTyped('')
    setStage('typing')
    const q = DEMO_QUERIES[active].q
    let i = 0
    const interval = setInterval(() => {
      i++
      setTyped(q.slice(0, i))
      if (i >= q.length) {
        clearInterval(interval)
        setTimeout(() => setStage('result'), 480)
      }
    }, 38)
    return () => clearInterval(interval)
  }, [active])

  const cols = stage === 'result' ? 2 : 1

  return (
    <section id="demo" className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-[#0F3D38] text-[#2DD4BF] border-[#2DD4BF]/20">Live Demo</Badge>
          <h2 className="font-mono text-4xl font-bold text-[#E8EDF2] mb-4 tracking-tight">See It In Action</h2>
          <p className="text-[#8FA3B8] text-lg">
            Pick a query — watch NL turn into live charts in under&nbsp;5 seconds.</p>
        </div>

        {/* Query chip selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DEMO_QUERIES.map((item, i) => (
            <button
              key={item.tag}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all font-mono ${
                active === i
                  ? 'bg-[#2DD4BF] border-[#2DD4BF] text-[#080B0E] shadow-accent'
                  : 'bg-[#0D1117] border-[#253040] text-[#8FA3B8] hover:border-[#2DD4BF]/40 hover:text-[#E8EDF2]'
              }`}
            >
              {item.tag}
            </button>
          ))}
        </div>

        {/* Terminal panel */}
        <div className="rounded-2xl border border-[#253040] overflow-hidden shadow-2xl shadow-black/60">
          {/* Chrome bar */}
          <div className="flex items-center gap-3 bg-[#0D1117] px-4 py-3 border-b border-[#1C2730]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#F87171]/70" />
              <div className="w-3 h-3 rounded-full bg-[#FBBF24]/70" />
              <div className="w-3 h-3 rounded-full bg-[#34D399]/70" />
            </div>
            <div className="flex-1 bg-[#131920] rounded-md h-6 flex items-center px-3">
              <span className="font-jetbrains text-xs text-[#4F6478]">app.querymind.ai/dashboard</span>
            </div>
            {stage === 'result' && (
              <span className="text-xs font-jetbrains text-[#34D399] flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                Query complete
              </span>
            )}
          </div>

          <div className="bg-[#080B0E] p-6">
            {/* Query input row */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#2DD4BF]/30 bg-[#131920] px-4 py-3">
              <Sparkles className="w-4 h-4 text-[#2DD4BF] flex-shrink-0" />
              <span className="font-jetbrains text-sm text-[#5EEAD4] flex-1">
                {typed}
                {stage === 'typing' && <span className="inline-block w-0.5 h-4 bg-[#2DD4BF] ml-0.5 align-middle animate-pulse" />}
              </span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${stage === 'result' ? 'bg-[#34D399]' : 'bg-[#2DD4BF]'}`}>
                {stage === 'result'
                  ? <Check className="h-3.5 w-3.5 text-[#080B0E]" />
                  : <Zap className="h-3.5 w-3.5 text-[#080B0E]" />}
              </div>
            </div>

            {/* Result grid — fades in when stage=result */}
            <div
              className={`grid gap-4 transition-all duration-700 ${stage === 'result' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {/* Chart 1 — Line */}
              <div className="glass-card rounded-xl p-4">
                <p className="mb-1 text-xs font-semibold text-[#8FA3B8]">Revenue by Region</p>
                <p className="mb-3 font-jetbrains text-xs text-[#4F6478]">Monthly · 2024</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={mockRevenueLineData.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C2730" />
                    <XAxis dataKey="month" tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1A232D', border: '1px solid #344558', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
                    {['north', 'south', 'east', 'west'].map((k, i) => (
                      <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2 — Bar */}
              <div className="glass-card rounded-xl p-4">
                <p className="mb-1 text-xs font-semibold text-[#8FA3B8]">Category Breakdown</p>
                <p className="mb-3 font-jetbrains text-xs text-[#4F6478]">Revenue vs Profit</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={mockCategoryBarData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1C2730" />
                    <XAxis dataKey="category" tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4F6478', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1A232D', border: '1px solid #344558', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="revenue" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#34D399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI insight strip */}
              <div className="col-span-full rounded-xl border border-[#2DD4BF]/20 bg-[#131920] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-[#2DD4BF]" />
                  <span className="text-xs font-semibold text-[#5EEAD4]">AI Insights</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: '📈', text: 'North region grew 31% YoY — highest performer in Q3.' },
                    { icon: '⚠️', text: 'Electronics margin fell 4 pts; investigate supply-chain costs.' },
                    { icon: '💡', text: 'Weekend orders 22% higher AOV — consider targeted promo.' },
                  ].map((tip) => (
                    <div key={tip.icon} className="flex gap-2.5 text-xs text-[#8FA3B8] leading-relaxed">
                      <span className="text-base leading-none mt-0.5">{tip.icon}</span>
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton keep space when typing */}
            {stage === 'typing' && (
              <div className="grid grid-cols-2 gap-4 opacity-20">
                <div className="glass-card rounded-xl h-52 animate-pulse" />
                <div className="glass-card rounded-xl h-52 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// === HOW IT WORKS ===
function HowItWorksSection() {
  const steps = [
    { icon: MessageSquare, title: 'Type Your Question', desc: 'Ask in plain English, just like you\'d ask a colleague.' },
    { icon: Sparkles, title: 'AI Builds the Query', desc: 'QueryMind generates precise SQL and selects the perfect chart types.' },
    { icon: BarChart2, title: 'Instant Dashboard', desc: 'Interactive, shareable charts appear in under 5 seconds.' },
  ]

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#0F3D38] text-[#2DD4BF] border-[#2DD4BF]/20">Process</Badge>
          <h2 className="font-mono text-4xl font-bold text-[#E8EDF2] mb-4 tracking-tight">How It Works</h2>
          <p className="text-[#8FA3B8] text-lg">Three steps from question to insight</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              {i < 2 && (
                <div className="hidden md:block absolute top-10 -right-3 w-6 z-10">
                  <ChevronRight className="w-6 h-6 text-[#2DD4BF]/40" />
                </div>
              )}
              <div className={`glass-card glass-card-hover rounded-xl p-6 border-t-2 border-t-[#2DD4BF]/40 step-card-${i + 1}`}>
                <div className="w-12 h-12 rounded-lg bg-[#0F3D38] border border-[#2DD4BF]/20 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-[#2DD4BF]" />
                </div>
                <div className="font-mono text-xs text-[#2DD4BF] mb-2 tracking-widest">0{i + 1}</div>
                <h3 className="font-mono font-semibold text-[#E8EDF2] text-lg mb-2">{step.title}</h3>
                <p className="text-[#8FA3B8] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// === FEATURES GRID ===
function FeaturesSection() {
  const features = [
    { icon: Sparkles, title: 'Natural Language to SQL', desc: 'Describe what you want in plain English. Our AI translates your business question into optimized SQL instantly.' },
    { icon: BarChart2, title: 'Smart Chart Selection', desc: 'AI automatically selects the most appropriate visualization — line charts for trends, pies for distribution, bars for comparison.' },
    { icon: Brain, title: 'AI-Generated Insights', desc: 'Beyond charts, get 3–5 bullet-point business insights that highlight anomalies, trends, and actionable findings.' },
    { icon: Upload, title: 'Upload Your Own CSV', desc: 'Drag and drop any CSV file and start querying it in natural language within 30 seconds.' },
    { icon: MessageSquare, title: 'Chat With Your Dashboard', desc: 'Ask follow-up questions to refine, filter, and drill deeper into your data in a natural conversational flow.' },
    { icon: Share2, title: 'Export & Share', desc: 'Download charts as PNG, export full dashboards as PDF, or copy shareable links with one click.' },
  ]

  return (
    <section id="features" className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0D1117]/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-[#0F3D38] text-[#2DD4BF] border-[#2DD4BF]/20">Features</Badge>
          <h2 className="font-mono text-4xl font-bold text-[#E8EDF2] mb-4 tracking-tight">Everything You Need</h2>
          <p className="text-[#8FA3B8] text-lg max-w-2xl mx-auto">
            A complete BI platform powered by AI — no technical skills required
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title}
              className={`glass-card glass-card-hover rounded-xl p-6 group cursor-default step-card-${Math.min(i + 1, 4)}`}>
              <div className="w-10 h-10 rounded-lg bg-[#0F3D38] border border-[#2DD4BF]/20 flex items-center justify-center mb-4 group-hover:bg-[#2DD4BF]/10 transition-colors">
                <f.icon className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <h3 className="font-mono font-semibold text-[#E8EDF2] mb-2">{f.title}</h3>
              <p className="text-[#8FA3B8] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// === PRICING ===
function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-[#0F3D38] text-[#2DD4BF] border-[#2DD4BF]/20">Pricing</Badge>
          <h2 className="font-mono font-bold text-4xl text-[#E8EDF2] mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-[#8FA3B8] text-lg">Start free. Upgrade when you're ready.</p>
        </div>
        <BentoPricing />
      </div>
    </section>
  )
}

// === FOOTER ===
function Footer() {
  return (
    <footer className="border-t border-[#1C2730] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
              </span>
              <span className="font-mono font-bold text-[#E8EDF2]">QueryMind</span>
            </div>
            <p className="text-xs text-[#4F6478]">Conversational AI for Business Intelligence</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#4F6478]">
            {['Features', 'Pricing', 'Privacy Policy', 'Terms of Service'].map(l => (
              <a key={l} href="#" className="hover:text-[#8FA3B8] transition-colors">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#131920] border border-[#1C2730] flex items-center justify-center text-[#4F6478] hover:text-[#8FA3B8] hover:border-[#2DD4BF]/30 transition-all">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#1C2730] text-center">
          <p className="text-xs text-[#4F6478]">© 2025 QueryMind. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// === MAIN LANDING PAGE ===
export default function LandingPage() {
  useEffect(() => { document.title = 'QueryMind — Conversational AI Business Intelligence' }, [])

  return (
    <div className="min-h-screen bg-[#080B0E] text-[#E8EDF2]">
      <LandingNavbar />
      <HeroSection />
      <DemoSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  )
}
