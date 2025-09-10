import api from './axios'

export type LoginPayload = { email: string; password: string }
export type AdminUser = { _id: string; name: string; email: string; role: 'admin' }

export async function adminLogin(payload: LoginPayload) {
  // Backend may set httpOnly cookie and also return token+user; we accept both.
  const { data } = await api.post('/admin/auth/login', payload)
  return data as { token?: string; user?: AdminUser; message?: string }
}

export async function adminLogout() {
  // Prefer generic logout route; fallback to admin route if needed
  try {
    await api.post('/auth/logout')
  } catch {
    try { await api.post('/admin/auth/logout') } catch {}
  }
}

export type AdminSignupPayload = { name: string; email: string; password: string; signupCode: string }
export async function adminSignup(payload: AdminSignupPayload) {
  const { data } = await api.post('/admin/auth/signup', payload)
  return data as { token: string; user: AdminUser }
}

export async function forgotPassword(email: string) {
  const { data } = await api.post('/auth/forgot-password', { email })
  return data as { message: string; signupUrl?: string }
}

export async function resetPassword(params: { email: string; token: string; newPassword: string }) {
  const { data } = await api.post('/auth/reset-password', params)
  return data as { message: string }
}
