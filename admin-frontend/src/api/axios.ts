import axios from 'axios'

const rawBase = (typeof window !== 'undefined' && (window as any).__API_BASE__) || import.meta.env.VITE_API_BASE_URL || '/api'
const baseURL = String(rawBase).replace(/\/$/, '') // strip trailing slash

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      // Let auth context handle logout; as a fallback, redirect.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
