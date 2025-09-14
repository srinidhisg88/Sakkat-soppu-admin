import api from './axios'

export type Farmer = {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  farmName?: string
  farmDescription?: string
  farmImages?: string[]
  farmVideos?: string[]
  latitude?: number
  longitude?: number
}

export async function getFarmers(params?: { page?: number; limit?: number; search?: string; sort?: string }) {
  const { data } = await api.get('/admin/farmers', { params })
  return data as { data: Farmer[]; page?: number; limit?: number; total?: number; totalPages?: number }
}

export type UpsertFarmer = Partial<Omit<Farmer, '_id'>> & { password?: string }

export async function createFarmer(input: UpsertFarmer) {
  const { data } = await api.post('/admin/farmers', input)
  return data as { success: boolean }
}

export async function updateFarmer(id: string, input: UpsertFarmer) {
  const { data } = await api.put(`/admin/farmers/${id}`, input)
  return data as { success: boolean }
}

export async function deleteFarmer(id: string) {
  const { data } = await api.delete(`/admin/farmers/${id}`)
  return data as { success: boolean }
}
