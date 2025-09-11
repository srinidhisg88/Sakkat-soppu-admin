import api from './axios'

export type LoginPayload = { email: string; password: string }
export type AdminUser = { _id: string; name: string; email: string; role: 'admin' }

export async function adminLogin(payload: LoginPayload) {
  // Try common admin login routes; accept whichever your backend exposes.
  const candidates = ['/admin/auth/login', '/auth/admin/login', '/admin/login', '/auth/login']
  let lastError: any
  for (const path of candidates) {
    try {
      const { data } = await api.post(path, payload)
      return data as { token?: string; user?: AdminUser; message?: string }
    } catch (err: any) {
      lastError = err
      // Try next candidate only on 404/405/400; for 401 keep trying in case path mismatch
      const status = err?.response?.status
      if (![400, 401, 404, 405].includes(status)) {
        break
      }
    }
  }
  throw lastError
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
  // Backend expects `adminCode` and disallows unknown keys; omit `signupCode` in the body
  const { signupCode, ...rest } = payload
  const body = { ...rest, adminCode: signupCode }
  const { data } = await api.post('/auth/admin/signup', body)
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
