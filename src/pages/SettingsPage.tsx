import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Lock, Bell, Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'Must be at least 8 characters.', variant: 'destructive' })
      return
    }
    toast({ title: 'Password change coming soon', description: 'This feature will be available shortly.' })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#080B0E] text-[#E8EDF2]">
      {/* Header */}
      <header className="h-14 flex items-center gap-4 px-6 border-b border-[#1C2730] bg-[#080B0E]/95 backdrop-blur-xl sticky top-0 z-40">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#8FA3B8] hover:text-[#E8EDF2] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <Separator orientation="vertical" className="h-5 bg-[#1C2730]" />
        <span className="font-mono font-bold text-[#E8EDF2]">Settings</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Profile Section */}
        <section className="bg-[#0D1117] border border-[#1C2730] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#2DD4BF]" />
            <h2 className="font-mono font-semibold text-sm text-[#8FA3B8] uppercase tracking-widest">Profile</h2>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg font-mono bg-[#0F3D38] text-[#2DD4BF] border border-[#2DD4BF]/20">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-[#E8EDF2]">{userName}</p>
              <p className="text-sm text-[#4F6478] font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8FA3B8] uppercase tracking-wider mb-1.5">Display Name</label>
              <input
                type="text"
                defaultValue={userName}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-[#131920] border border-[#1C2730] text-[#8FA3B8] text-sm font-mono cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8FA3B8] uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="text"
                defaultValue={user?.email || ''}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-[#131920] border border-[#1C2730] text-[#8FA3B8] text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-[#0D1117] border border-[#1C2730] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-[#2DD4BF]" />
            <h2 className="font-mono font-semibold text-sm text-[#8FA3B8] uppercase tracking-widest">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#8FA3B8] uppercase tracking-wider mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-[#131920] border border-[#1C2730] text-[#E8EDF2] text-sm font-mono focus:outline-none focus:border-[#2DD4BF]/50 transition-colors placeholder:text-[#4F6478]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#8FA3B8] uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#131920] border border-[#1C2730] text-[#E8EDF2] text-sm font-mono focus:outline-none focus:border-[#2DD4BF]/50 transition-colors placeholder:text-[#4F6478]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8FA3B8] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-[#131920] border border-[#1C2730] text-[#E8EDF2] text-sm font-mono focus:outline-none focus:border-[#2DD4BF]/50 transition-colors placeholder:text-[#4F6478]"
                />
              </div>
            </div>
            <Button type="submit" className="bg-[#2DD4BF] text-[#080B0E] hover:bg-[#2DD4BF]/90 font-semibold">
              Update Password
            </Button>
          </form>
        </section>

        {/* Preferences Section */}
        <section className="bg-[#0D1117] border border-[#1C2730] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-[#2DD4BF]" />
            <h2 className="font-mono font-semibold text-sm text-[#8FA3B8] uppercase tracking-widest">Preferences</h2>
          </div>

          {[
            { label: 'Query success notifications', description: 'Play a sound when a dashboard is ready' },
            { label: 'Error notifications', description: 'Play a sound when a query fails' },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between py-3 border-b border-[#1C2730] last:border-0">
              <div>
                <p className="text-sm text-[#E8EDF2]">{pref.label}</p>
                <p className="text-xs text-[#4F6478] font-mono mt-0.5">{pref.description}</p>
              </div>
              <div className="w-10 h-5 rounded-full bg-[#2DD4BF]/20 border border-[#2DD4BF]/30 flex items-center px-1 cursor-not-allowed">
                <div className="w-3.5 h-3.5 rounded-full bg-[#2DD4BF]" />
              </div>
            </div>
          ))}
        </section>

        {/* Account Section */}
        <section className="bg-[#0D1117] border border-[#1C2730] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-[#2DD4BF]" />
            <h2 className="font-mono font-semibold text-sm text-[#8FA3B8] uppercase tracking-widest">Account</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#E8EDF2]">Sign out</p>
              <p className="text-xs text-[#4F6478] font-mono mt-0.5">Sign out of your QueryMind account</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </section>

      </div>
    </div>
  )
}
