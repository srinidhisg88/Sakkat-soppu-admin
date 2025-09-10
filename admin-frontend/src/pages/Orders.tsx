import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { getOrders, updateOrderStatus, Order } from '@/api/ordersApi'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import StatusBadge from '@/components/StatusBadge'
import Loader from '@/components/ui/Loader'

const statuses: Order['status'][] = ['pending', 'confirmed', 'delivered', 'cancelled']

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await getOrders({ limit: 100, sort: '-createdAt' })
      setOrders(res.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const onChangeStatus = async (orderId: string, status: Order['status']) => {
    const prev = orders
    setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, status } : o)))
    try {
      await updateOrderStatus(orderId, status)
      toast.success('Status updated')
    } catch (err: any) {
      setOrders(prev)
      toast.error(err?.response?.data?.message || 'Failed to update status')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      {loading ? (
        <div className="p-8 flex justify-center"><Loader /></div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Order ID</TH>
              <TH>User</TH>
              <TH>Items</TH>
              <TH>Total</TH>
              <TH>Status</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {orders.map((o) => (
              <TR key={o._id}>
                <TD className="font-mono">{o._id}</TD>
                <TD>{typeof o.userId === 'string' ? o.userId : o.userId?.email || o.userId?._id}</TD>
                <TD>
                  <ul className="list-disc list-inside">
                    {o.items.map((it, idx) => (
                      <li key={idx}>
                        {it.productId} × {it.quantity} @ {it.price}
                      </li>
                    ))}
                  </ul>
                </TD>
                <TD>₹{o.totalPrice.toFixed(2)}</TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <select
                      className="border rounded px-2 py-1"
                      value={o.status}
                      onChange={(e) => onChangeStatus(o._id, e.target.value as Order['status'])}
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
      )}
    </div>
  )
}
