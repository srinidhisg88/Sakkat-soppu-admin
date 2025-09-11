import axios from 'axios'

function resolveBaseURL() {
  // 1) Runtime override from index.html
  const winBase = (typeof window !== 'undefined' && (window as any).__API_BASE__) || undefined
  if (winBase) return String(winBase).replace(/\/$/, '')

  // 2) Build-time env
  const envBase = import.meta.env.VITE_API_BASE_URL
  if (envBase) return String(envBase).replace(/\/$/, '')

  // 3) Default to deployed API if nothing else provided (works on localhost too)
  return 'https://sakkat-soppu-be-production.up.railway.app/api'
}

export const baseURL = resolveBaseURL()

if (import.meta.env.DEV) {
  console.info('[API] baseURL =', baseURL)
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // Avoid forcing a redirect; ProtectedRoute/AuthContext decide. Log for diagnosis.
      if (import.meta.env.DEV) console.warn('[API] 401 Unauthorized on', error?.config?.url)
    }
    return Promise.reject(error)
  },
)

export default api
