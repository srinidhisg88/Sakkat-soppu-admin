import { createContext, useContext, useEffect, useState } from 'react'
import { adminLogin, adminLogout } from '@/api/authApi'

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
    // Skip network auth check when on public routes to avoid proxy errors before login.
    const check = async () => {
      const publicPaths = new Set(['/', '/login', '/forgot-password', '/reset-password', '/admin-signup'])
      const path = window.location.pathname
      if (publicPaths.has(path)) {
        setLoading(false)
        return
      }
      try {
  // Use axios instance to respect baseURL and credentials in prod (Netlify)
  // Keep it lightweight with small page/limit
        const { api } = await import('@/api/axios')
        await api.get('/admin/orders', { params: { page: 1, limit: 1 } })
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
