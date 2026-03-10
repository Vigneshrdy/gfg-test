import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, ArrowRight, Shield, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import {
  LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis
} from 'recharts'
import { mockRevenueLineData, CHART_COLORS } from '@/data/mockData'

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = (p: string) => {
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }

  const score = getStrength(password)
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#F87171', '#FBBF24', '#60A5FA', '#34D399']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : '#1C2730' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] }}>
        {score > 0 && labels[score]}
      </p>
    </div>
  )
}

function DecorativeLeft() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-[#080B0E] p-10 relative overflow-hidden">
      {/* Animated blob */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-[#2DD4BF]/8 blur-[80px] animate-blob-move" />

      <div className="relative z-10 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2DD4BF]" />
        </span>
        <span className="font-mono font-bold text-lg text-[#E8EDF2]">QueryMind</span>
      </div>

      <div className="relative z-10 space-y-10">
        <blockquote className="font-mono italic text-3xl font-bold text-[#E8EDF2] leading-snug">
          "Your data has answers.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4]">
            You just need to ask."
          </span>
        </blockquote>

        <div className="space-y-3">
          {[
            { name: 'Sarah Chen', role: 'VP of Analytics, TechCorp', quote: 'Reduced our reporting time by 80%. Game changer.' },
            { name: 'Marcus Webb', role: 'CEO, GrowthLabs', quote: 'I asked my first SQL question ever. It just worked.' },
            { name: 'Priya Nair', role: 'Data Lead, InsightHQ', quote: 'Our whole team uses this. No more Slack requests.' },
          ].map(t => (
            <div key={t.name} className="glass-card rounded-lg p-4 border border-[#1C2730]">
              <p className="text-[#8FA3B8] text-sm mb-2 italic">"{t.quote}"</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#0F3D38] flex items-center justify-center text-[#080B0E] text-xs font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#E8EDF2]">{t.name}</p>
                  <p className="text-xs text-[#4F6478]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4">
        {[
          { icon: Lock, label: '256-bit Encryption' },
          { icon: Shield, label: 'SOC2 Ready' },
          { icon: Globe, label: 'GDPR Compliant' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-1.5 text-xs text-[#4F6478]">
            <b.icon className="w-3 h-3 text-[#2DD4BF]" />
            {b.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { document.title = 'QueryMind — Sign Up' }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!agreed) e.terms = 'You must agree to the terms'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    const { error } = await signup(form.email, form.password, form.fullName)
    setLoading(false)
    if (error) {
      if (error.message?.toLowerCase().includes('already')) {
        setErrors({ email: 'An account with this email already exists. Log in instead?' })
      } else {
        setErrors({ global: error.message })
      }
      return
    }
    toast({ title: 'Welcome to QueryMind! 🎉', description: 'Your account was created successfully.' })
    const redirectUrl = localStorage.getItem('querymind_redirect_url')
    localStorage.removeItem('querymind_redirect_url')
    navigate(redirectUrl || '/dashboard')
  }

  const handleGoogle = async () => {
    const { error } = await loginWithGoogle()
    if (error) {
      toast({ title: 'Google sign-in not available', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#080B0E]">
      <DecorativeLeft />

      {/* Form panel */}
      <div className="flex items-center justify-center p-8 bg-[#0D1117]">
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
            <h1 className="font-mono font-bold text-3xl text-[#E8EDF2] mb-1 tracking-tight">Create your account</h1>
            <p className="text-[#8FA3B8] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2DD4BF] hover:underline font-medium">Log in</Link>
            </p>
          </div>

          {/* Google OAuth */}
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

          {errors.global && (
            <div className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-xs text-[#fca5a5]">
              {errors.global}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Alex Johnson" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              {errors.fullName && <p className="text-xs text-[#ef4444]">{errors.fullName}</p>}
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" type="email" placeholder="alex@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && (
                <p className="text-xs text-[#ef4444]">
                  {errors.email}{' '}
                  {errors.email.includes('already') && <Link to="/login" className="underline">Log in instead</Link>}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F6478] hover:text-[#8FA3B8] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={form.password} />
              {errors.password && <p className="text-xs text-[#ef4444]">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password"
                  value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                <button type="button" onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F6478] hover:text-[#8FA3B8] transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-[#ef4444]">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
              <label htmlFor="terms" className="text-xs text-[#8FA3B8] cursor-pointer leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#2DD4BF] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#2DD4BF] hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <p className="text-xs text-[#ef4444] -mt-2">{errors.terms}</p>}

            <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
