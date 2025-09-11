import { useState } from 'react'

export type OrderFiltersState = {
  status?: string
  from?: string
  to?: string
  userId?: string
}

export default function OrderFilters({ initial, onApply, onClear }: { initial?: OrderFiltersState; onApply: (f: OrderFiltersState) => void; onClear: () => void }) {
  const [local, setLocal] = useState<OrderFiltersState>(initial || {})
  const set = (k: keyof OrderFiltersState, v: string) => setLocal((s) => ({ ...s, [k]: v || undefined }))

  return (
    <div className="bg-white border rounded-md p-3 mb-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full rounded-md border-gray-300 focus:border-green-600 focus:ring-green-500"
            value={local.status || ''}
            onChange={(e) => set('status', e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            className="w-full rounded-md border-gray-300 focus:border-green-600 focus:ring-green-500"
            value={local.from || ''}
            onChange={(e) => set('from', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            className="w-full rounded-md border-gray-300 focus:border-green-600 focus:ring-green-500"
            value={local.to || ''}
            onChange={(e) => set('to', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input
            type="text"
            placeholder="u123..."
            className="w-full rounded-md border-gray-300 focus:border-green-600 focus:ring-green-500"
            value={local.userId || ''}
            onChange={(e) => set('userId', e.target.value)}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
          onClick={() => onApply(local)}
        >
          Apply
        </button>
        <button
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
          onClick={() => {
            setLocal({})
            onClear()
          }}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
