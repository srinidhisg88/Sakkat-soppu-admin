import { clsx } from 'clsx'
import { type ButtonHTMLAttributes, forwardRef, useState, useEffect } from 'react'
import { useUploadProgress } from '@/context/UploadProgressContext'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  loading?: boolean
  requestId?: string // Optional: track specific request
  showProgress?: boolean // Show progress bar (default: true)
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, requestId, showProgress = true, className, children, disabled, ...props }, ref) => {
    const { progress } = useUploadProgress()
    const [localProgress, setLocalProgress] = useState(0)

    // Track progress for this button's request
    useEffect(() => {
      if (requestId && progress[requestId] !== undefined) {
        setLocalProgress(progress[requestId])
      } else if (!requestId && !loading) {
        // Reset when not loading and no specific request
        setLocalProgress(0)
      }
    }, [requestId, progress, loading])

    const isLoading = loading || (requestId && progress[requestId] !== undefined && progress[requestId] < 100)
    const showBar = showProgress && isLoading && localProgress > 0

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'relative px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
          variant === 'primary' && 'bg-green-600 text-white hover:bg-green-700',
          variant === 'ghost' && 'hover:bg-gray-100',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
          className,
        )}
        {...props}
      >
        {/* Progress bar background */}
        {showBar && (
          <span
            className="absolute inset-0 bg-white/20 transition-all duration-300 ease-out"
            style={{
              width: `${localProgress}%`,
            }}
          />
        )}

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {isLoading ? (
            showBar && localProgress > 0 ? (
              `${children} (${localProgress}%)`
            ) : (
              `${children}...`
            )
          ) : (
            children
          )}
        </span>
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button