import { createContext, useContext, useEffect, useState } from 'react'
import { adminLogin, adminLogout } from '@/api/authApi'
import api from '@/api/axios'

type AuthContextType = {
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const publicPaths = new Set(['/', '/login', '/forgot-password', '/reset-password', '/admin-signup'])
      const path = window.location.pathname
      if (publicPaths.has(path)) { setLoading(false); return }
      try {
        // Prefer a lightweight auth check endpoint if available; fallback to a simple ping
        // This call relies on cookies; ensure backend sets SameSite=None; Secure for Vercel.
        await api.get('/auth/me').catch(async (err) => {
          if (err?.response?.status === 404) {
            // Fallback: call a cheap public endpoint that still requires auth implicitly
            await api.get('/admin/orders', { params: { page: 1, limit: 1 } })
          } else { throw err }
        })
        setIsAuthenticated(true)
      } catch {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [])

  const login = async (email: string, password: string) => {
    await adminLogin({ email, password })
    setIsAuthenticated(true)
  }

  const logout = async () => {
    await adminLogout()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
