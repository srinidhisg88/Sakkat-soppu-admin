import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import StatusBadge from '@/components/StatusBadge'
import type { Order } from '@/api/ordersApi'
import { getOrderById } from '@/api/ordersApi'

export default function OrderDrawer({ order, open, onClose }: { order?: Order; open: boolean; onClose: () => void }) {
  const [full, setFull] = useState<Order | undefined>(order)

  useEffect(() => {
    let active = true
    async function load() {
      if (open && order?._id) {
        try {
          const data = await getOrderById(order._id)
          if (active) setFull(data)
        } catch {
          if (active) setFull(order)
        }
      } else {
        setFull(order)
      }
    }
    load()
    return () => { active = false }
  }, [open, order?._id])
  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-xl transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order details</h2>
          <button className="px-2 py-1 rounded-md border hover:bg-gray-50" onClick={onClose}>Close</button>
        </div>
        {!full ? (
          <div className="p-4 text-gray-500">No order selected.</div>
        ) : (
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Customer</div>
                <div className="font-medium">{typeof full.userId === 'string' ? '' : (full as any).userId?.name || (full as any).userId?.username || (full as any).userId?.email}</div>
              </div>
              <StatusBadge status={full.status} />
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Items</div>
              <ul className="space-y-2">
                {full.items.map((it, idx) => {
                  const name = typeof it.productId === 'string' ? '[product]' : (it as any).productId?.name || '[product]'
                  return (
                    <li key={idx} className="flex justify-between">
                      <span>{name} × {it.quantity}</span>
                      <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{full.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Payment</div>
                <div className="font-medium">{full.paymentMode || 'COD'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">{dayjs(full.createdAt).format('YYYY-MM-DD HH:mm')}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <div className="font-medium whitespace-pre-wrap">{full.address || '-'}</div>
              {(full.latitude && full.longitude) ? (
                <a
                  className="mt-2 inline-flex text-green-700 hover:underline"
                  href={`https://www.google.com/maps?q=${full.latitude},${full.longitude}`}
                  target="_blank" rel="noreferrer"
                >
                  View on map
                </a>
              ) : null}
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Meta</div>
              <div className="text-sm text-gray-600">Idempotency key: {(full as any)?.idempotencyKey || '-'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
