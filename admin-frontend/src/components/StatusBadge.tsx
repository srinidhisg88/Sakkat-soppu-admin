import clsx from 'classnames'

export default function StatusBadge({ status }: { status: 'pending' | 'confirmed' | 'delivered' | 'cancelled' }) {
  const color = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status]
  return <span className={clsx('px-2 py-1 text-xs rounded', color)}>{status}</span>
}
