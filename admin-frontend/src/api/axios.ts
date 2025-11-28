import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

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

// Upload progress tracking types
export type UploadProgressCallback = (requestId: string, percent: number) => void
export type UploadCompleteCallback = (requestId: string) => void

let globalProgressCallback: UploadProgressCallback | null = null
let globalCompleteCallback: UploadCompleteCallback | null = null

export function setGlobalUploadCallbacks(
  onProgress: UploadProgressCallback,
  onComplete: UploadCompleteCallback
) {
  globalProgressCallback = onProgress
  globalCompleteCallback = onComplete
}

// Request interceptor to attach progress tracking
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate a unique request ID for tracking
    const requestId = (config as any).__requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    ;(config as any).__requestId = requestId

    // Attach upload progress handler if callbacks are set
    if (globalProgressCallback) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0
        globalProgressCallback?.(requestId, percentCompleted)
      }

      // For non-upload requests (GET, DELETE without body), simulate progress
      if (!config.data && globalProgressCallback) {
        globalProgressCallback(requestId, 0)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (res) => {
    const requestId = (res.config as any).__requestId
    if (requestId && globalCompleteCallback) {
      globalCompleteCallback(requestId)
    }
    return res
  },
  (error) => {
    const requestId = (error?.config as any)?.__requestId
    if (requestId && globalCompleteCallback) {
      globalCompleteCallback(requestId)
    }

    if (error?.response?.status === 401) {
      // Avoid forcing a redirect; ProtectedRoute/AuthContext decide. Log for diagnosis.
      if (import.meta.env.DEV) console.warn('[API] 401 Unauthorized on', error?.config?.url)
    }
    return Promise.reject(error)
  },
)

// Helper to make request with custom request ID (useful for button-specific tracking)
export function makeRequestWithId(requestId: string, config: AxiosRequestConfig) {
  return api.request({
    ...config,
    __requestId: requestId,
  } as any)
}

export default api
