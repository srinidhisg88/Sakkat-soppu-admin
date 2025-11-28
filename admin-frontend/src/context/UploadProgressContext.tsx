import { createContext, useContext, useState, useCallback } from 'react'

type UploadProgressState = {
  [requestId: string]: number // 0-100 percentage
}

type UploadProgressContextType = {
  progress: UploadProgressState
  setProgress: (requestId: string, percent: number) => void
  removeProgress: (requestId: string) => void
  generateRequestId: () => string
}

const UploadProgressContext = createContext<UploadProgressContextType | undefined>(undefined)

export function UploadProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgressState] = useState<UploadProgressState>({})

  const setProgress = useCallback((requestId: string, percent: number) => {
    setProgressState((prev) => ({
      ...prev,
      [requestId]: Math.min(100, Math.max(0, percent)),
    }))
  }, [])

  const removeProgress = useCallback((requestId: string) => {
    setProgressState((prev) => {
      const next = { ...prev }
      delete next[requestId]
      return next
    })
  }, [])

  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  return (
    <UploadProgressContext.Provider
      value={{ progress, setProgress, removeProgress, generateRequestId }}
    >
      {children}
    </UploadProgressContext.Provider>
  )
}

export function useUploadProgress() {
  const ctx = useContext(UploadProgressContext)
  if (!ctx) throw new Error('useUploadProgress must be used within UploadProgressProvider')
  return ctx
}
