import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword } from '@/api/authApi'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const qp = new URLSearchParams(location.search)
    const e = qp.get('email') || ''
    const t = qp.get('token') || ''
    if (e) setEmail(e)
    if (t) setToken(t)
  }, [location.search])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await resetPassword({ email, token, newPassword })
      toast.success(res.message)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-white p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white font-bold shadow">SS</div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">Sakkat Soppu</div>
          <div className="text-sm text-gray-500">Reset Password</div>
        </div>
        <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur border rounded-xl shadow p-6 space-y-4 animate-scale-in">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Token</label>
            <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={token} onChange={(e) => setToken(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input type="password" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-60" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
          <div className="text-center text-sm">
            <a href="/login" className="text-green-700 hover:underline">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  )
}
