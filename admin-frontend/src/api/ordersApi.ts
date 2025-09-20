import api from './axios'

export type OrderItem = {
  productId: string | { _id: string; name?: string }
  // snapshot fields at checkout
  name?: string
  g?: number | null
  pieces?: number | null
  unitLabel?: string | null
  priceForUnitLabel?: string | null
  price: number
  quantity: number
}

export type Order = {
  _id: string
  userId: { _id: string; name?: string; username?: string; email?: string; phone?: string } | string
  customerPhone?: string
  items: OrderItem[]
  // totals
  subtotalPrice?: number
  discountAmount?: number
  couponCode?: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  paymentMode?: string
  address?: string
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt?: string
}

export type OrdersQuery = Partial<{
  status: string
  userId: string
  from: string
  to: string
  page: number
  limit: number
  sort: string
}>

export async function getOrders(query: OrdersQuery = {}) {
  const { data } = await api.get('/admin/orders', { params: query })
  return data as { data: Order[]; total?: number }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  // New endpoint
  try {
    const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status })
    return data as { _id: string; status: Order['status']; totalPrice?: number; updatedAt?: string }
  } catch {
    // Backward compat
    const { data } = await api.put(`/orders/${orderId}/status`, { status })
    return data as { _id: string; status: Order['status']; totalPrice?: number; updatedAt?: string }
  }
}

export async function getOrderById(orderId: string) {
  const { data } = await api.get(`/admin/orders/${orderId}`)
  return data as Order
}
