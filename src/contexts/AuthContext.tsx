import React, { createContext, useContext, useEffect, useState } from 'react'
import { loginApi, registerApi, getMeApi } from '../lib/api'

interface AuthUser {
  id: number
  email: string
  full_name: string
  role: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  signup: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  loginWithGoogle: () => Promise<{ error: Error | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'querymind_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: if we have a stored token, fetch the user profile
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    getMeApi()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await loginApi(email, password)
      localStorage.setItem(TOKEN_KEY, access_token)
      const me = await getMeApi()
      setUser(me)
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const signup = async (email: string, password: string, fullName: string) => {
    try {
      await registerApi(email, password, fullName)
      // After register, log in immediately
      return login(email, password)
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Google OAuth not supported in self-hosted mode
  const loginWithGoogle = async () => ({
    error: new Error('Google login is not available. Please use email & password.'),
  })

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
