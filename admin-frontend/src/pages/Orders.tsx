import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getOrders, updateOrderStatus, Order } from '@/api/ordersApi'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import StatusBadge from '@/components/StatusBadge'
import Loader from '@/components/ui/Loader'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import OrderFilters, { OrderFiltersState } from '@/components/orders/OrderFilters'
import OrderDrawer from '@/components/orders/OrderDrawer'
import { toCsv, downloadBlob } from '@/utils/csv'

const statuses: Order['status'][] = ['pending', 'confirmed', 'delivered', 'cancelled']

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<OrderFiltersState>({})
  const [selected, setSelected] = useState<Order | undefined>(undefined)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState<number | undefined>(undefined)

  const fetchOrders = async (f?: OrderFiltersState) => {
    setLoading(true)
    try {
      const res = await getOrders({
        page,
        limit,
        sort: '-createdAt',
        status: f?.status,
        userId: f?.userId,
        from: f?.from,
        to: f?.to,
      } as any)
      setOrders(res.data)
      setTotal(res.total)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(filters)
  }, [page, limit])

  const onChangeStatus = async (orderId: string, status: Order['status']) => {
    const prev = orders
    setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, status } : o)))
    try {
      await updateOrderStatus(orderId, status)
      toast.success('Status updated')
      // Optionally refresh the order row/list to reflect server state
      fetchOrders(filters)
    } catch (err: any) {
      setOrders(prev)
      toast.error(err?.response?.data?.message || 'Failed to update status')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <button
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
          onClick={() => {
            const headers = ['User', 'Items', 'Total', 'Status', 'Created']
            const rows = orders.map((o) => {
              const user = typeof o.userId === 'string' ? '' : (o as any).userId?.name || o.userId?.email || ''
              const items = o.items
                .map((it) => {
                  const title = it.name || (typeof it.productId === 'string' ? '[product]' : (it as any).productId?.name || '[product]')
                  const unit = it.unitLabel ? ` (${it.unitLabel})` : ''
                  return `${title}${unit} x${it.quantity} @ ${it.price}`
                })
                .join(' | ')
              return [user, items, o.totalPrice, o.status, dayjs(o.createdAt).format('YYYY-MM-DD HH:mm')]
            })
            downloadBlob(toCsv(headers, rows), `orders_${Date.now()}.csv`)
          }}
        >
          Export CSV
        </button>
      </div>

      <OrderFilters
        initial={filters}
        onApply={(f) => { setFilters(f); setPage(1); fetchOrders(f) }}
        onClear={() => { setFilters({}); setPage(1); fetchOrders({}) }}
      />
      {loading ? (
        <div className="p-4">
          <div className="bg-white border rounded shadow-sm p-4">
            <div className="grid grid-cols-5 gap-4 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        orders.length === 0 ? (
          <EmptyState title="No orders yet" message="Orders will appear here once customers place them." />
        ) : (
  <>
  <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Items</TH>
              <TH>Total</TH>
              <TH>Status</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {orders.map((o) => (
              <TR key={o._id} onClick={() => { setSelected(o); setDrawerOpen(true) }} className="cursor-pointer">
                <TD>{
                  typeof o.userId === 'string'
                    ? ''
                    : // Prefer name/username, then email
                      (o.userId as any)?.name || (o.userId as any)?.username || o.userId?.email || ''
                }</TD>
                <TD>
                  <ul className="list-disc list-inside">
                    {o.items.map((it, idx) => {
                      const title = it.name || (typeof it.productId === 'string' ? '[product]' : (it as any).productId?.name || '[product]')
                      const unit = it.unitLabel ? ` ${it.unitLabel}` : ''
                      return (
                        <li key={idx}>
                          {title}{unit} × {it.quantity} @ Rs {it.price}
                        </li>
                      )
                    })}
                  </ul>
                </TD>
                <TD>₹{o.totalPrice.toFixed(2)}</TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <select
                      className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
                      value={o.status}
                      onChange={(e) => onChangeStatus(o._id, e.target.value as Order['status'])}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </TD>
                <TD>{dayjs(o.createdAt).format('YYYY-MM-DD HH:mm')}</TD>
              </TR>
            ))}
          </TBody>
  </Table>
  <Pagination page={page} limit={limit} total={total} onPageChange={(p) => setPage(Math.max(1, p))} />
  </>
        )
      )}
      <OrderDrawer order={selected} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
