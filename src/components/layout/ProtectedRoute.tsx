import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function FullscreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#08080f]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#1e1e35] border-t-[#6366f1] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#6366f1] font-display font-bold text-lg">Q</span>
          </div>
        </div>
        <p className="text-[#4a4a6a] text-sm font-mono animate-pulse">Loading QueryMind...</p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullscreenLoader />

  if (!user) {
    const returnUrl = location.pathname + location.search
    localStorage.setItem('querymind_redirect_url', returnUrl)
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
