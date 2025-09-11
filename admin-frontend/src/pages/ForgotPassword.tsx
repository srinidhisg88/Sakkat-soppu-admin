import { useState } from 'react'
import toast from 'react-hot-toast'
import { forgotPassword } from '@/api/authApi'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      toast.success(res.message)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Request failed')
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
          <div className="text-sm text-gray-500">Forgot Password</div>
        </div>
        <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur border rounded-xl shadow p-6 space-y-4 animate-scale-in">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-60" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <div className="text-center text-sm">
            <a href="/login" className="text-green-700 hover:underline">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  )
}
