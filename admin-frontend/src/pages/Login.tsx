import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { baseURL } from '@/api/axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation() as any
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Logged in')
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || err?.message || 'Login failed'
      toast.error(status ? `${msg} (HTTP ${status})` : msg)
      toast.error(`API: ${baseURL}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden shadow bg-white">
            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">Sakkat Soppu</div>
          <div className="text-sm text-gray-500">Admin Login</div>
        </div>
        <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur border rounded-xl shadow p-6 space-y-4 animate-scale-in">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-60" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-green-700 hover:underline">Forgot password?</Link>
            <Link to="/admin-signup" className="text-green-700 hover:underline">Admin signup</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
