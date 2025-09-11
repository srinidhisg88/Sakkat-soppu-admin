import api from './axios'

export type Analytics = {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  totalSales: number
}

export async function getAnalytics() {
  const { data } = await api.get('/admin/analytics')
  return data as Analytics
}
