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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
        <div className="text-center">
          <div className="text-2xl font-extrabold">Sakkat Soppu</div>
          <div className="text-sm text-gray-500">Forgot Password</div>
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="w-full border px-3 py-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded disabled:opacity-60" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <div className="text-center text-sm">
          <a href="/login" className="text-green-700 hover:underline">Back to Login</a>
        </div>
      </form>
    </div>
  )
}
