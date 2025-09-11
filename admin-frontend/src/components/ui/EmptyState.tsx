import { ReactNode } from 'react'

export default function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-white border rounded p-8">
      <div className="text-lg font-semibold">{title}</div>
      {message && <div className="text-gray-500 mt-1">{message}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
