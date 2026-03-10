import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, Tooltip
} from 'recharts'
import { mockRevenueLineData, CHART_COLORS } from '@/data/mockData'

function DecorativeRight() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass-card p-2.5 rounded-lg border border-[#1C2730] text-xs">
        <p className="text-[#8FA3B8] mb-1">{label}</p>
        <p className="text-[#2DD4BF] font-mono">${(payload[0]?.value / 1000).toFixed(1)}K</p>
      </div>
    )
  }

  return (
    <div className="hidden lg:flex flex-col bg-[#0D1117] p-10 relative overflow-hidden">
      <div className="absolute inset-0 hero-grid-bg opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#2DD4BF]/5 blur-[120px]" />

      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="glass-card rounded-xl p-6 border border-[#1C2730] mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#4F6478] font-mono uppercase tracking-widest">Total Revenue</p>
              <p className="font-mono font-bold text-3xl text-[#E8EDF2]">$4.82M</p>
              <p className="text-xs text-[#34D399] mt-0.5 font-mono">+19.4% vs last year</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#0F3D38] border border-[#2DD4BF]/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-[#2DD4BF]" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={mockRevenueLineData}>
              <defs>
                <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2730" />
              <XAxis dataKey="month" tick={{ fill: '#4F6478', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="west" stroke="#2DD4BF" fill="url(#loginGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Active Queries', value: '12,840', change: '+34%', color: '#34D399' },
            { label: 'Dashboards', value: '2,419', change: '+28%', color: '#FBBF24' },
          ].map(stat => (
            <div key={stat.label} className="glass-card rounded-lg p-4 border border-[#1C2730]">
              <p className="text-xs text-[#4F6478] mb-1">{stat.label}</p>
              <p className="font-mono font-semibold text-xl text-[#E8EDF2]">{stat.value}</p>
              <p className="text-xs mt-0.5 font-mono" style={{ color: stat.color }}>{stat.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center">
        <p className="font-mono italic text-lg text-[#8FA3B8]">Your insights are waiting.</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'QueryMind — Log In' }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')
    const { error: err } = await login(email, password)
    setLoading(false)
    if (err) {
      setError(err.message?.includes('Invalid') ? 'Incorrect email or password' : err.message)
      return
    }
    toast({ title: 'Welcome back! ✦', description: 'Signed in successfully.' })
    const redirectUrl = localStorage.getItem('querymind_redirect_url')
    localStorage.removeItem('querymind_redirect_url')
    navigate(redirectUrl || '/dashboard')
  }

  const handleGoogle = async () => {
    const { error: err } = await loginWithGoogle()
    if (err) { toast({ title: 'Google sign-in not available', description: err.message, variant: 'destructive' }) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#080B0E]">
      {/* Form panel (LEFT on login) */}
      <div className="flex items-center justify-center p-8 bg-[#0D1117] order-last lg:order-first">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
            </span>
            <span className="font-mono font-bold text-[#E8EDF2]">QueryMind</span>
          </div>

          <div>
            <h1 className="font-mono font-bold text-4xl text-[#E8EDF2] mb-1 tracking-tight">Welcome back</h1>
            <p className="text-[#8FA3B8] text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#2DD4BF] hover:underline font-medium">Sign up free</Link>
            </p>
          </div>


          <Button type="button" onClick={handleGoogle} variant="outline" className="w-full gap-3 h-12 text-[#e2e8f0]">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1C2730]" />
            </div>
            <div className="relative flex justify-center text-xs text-[#4F6478] bg-[#0D1117] px-3">
              or continue with email
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-xs text-[#fca5a5]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-[#2DD4BF] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Your password"
                  value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F6478] hover:text-[#8FA3B8] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      <DecorativeRight />
    </div>
  )
}
