import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminSignup } from '@/api/authApi'

export default function AdminSignup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupCode, setSignupCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
  await adminSignup({ name, email, password, signupCode })
  toast.success('Admin created')
  navigate('/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4">
        <div className="text-center">
          <div className="text-2xl font-extrabold">Sakkat Soppu</div>
          <div className="text-sm text-gray-500">Admin Signup</div>
        </div>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full border px-3 py-2 rounded" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="w-full border px-3 py-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full border px-3 py-2 rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Signup Code</label>
          <input className="w-full border px-3 py-2 rounded" value={signupCode} onChange={(e) => setSignupCode(e.target.value)} required />
        </div>
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded disabled:opacity-60" disabled={loading}>
          {loading ? 'Creating…' : 'Create admin'}
        </button>
        <div className="text-center text-sm">
          <a href="/login" className="text-green-700 hover:underline">Back to Login</a>
        </div>
      </form>
    </div>
  )
}
