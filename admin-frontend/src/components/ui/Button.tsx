import { clsx } from 'clsx'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-green-600 text-white hover:bg-green-700',
        variant === 'ghost' && 'hover:bg-gray-100',
        className,
      )}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
)

Button.displayName = 'Button'

export default Button