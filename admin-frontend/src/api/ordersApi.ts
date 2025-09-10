import api from './axios'

export type OrderItem = {
  productId: string
  quantity: number
  price: number
}

export type Order = {
  _id: string
  userId: { _id: string; email?: string } | string
  items: OrderItem[]
  totalPrice: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  paymentMode?: string
  address?: string
  latitude?: number
  longitude?: number
  createdAt: string
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
  const { data } = await api.put(`/orders/${orderId}/status`, { status })
  return data as { success: boolean }
}
