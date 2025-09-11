import api from './axios'

export type Category = {
  _id: string
  name: string
  slug?: string
  createdAt?: string
  updatedAt?: string
}

const fromServer = (raw: any): Category => {
  const c = raw?.data ?? raw?.category ?? raw
  return {
    _id: c?._id || c?.id,
    name: c?.name,
    slug: c?.slug,
    createdAt: c?.createdAt,
    updatedAt: c?.updatedAt,
  }
}

// Public categories list for dropdowns
export async function getPublicCategories() {
  const { data } = await api.get('/categories')
  const list: Category[] = Array.isArray(data)
    ? data.map(fromServer)
    : Array.isArray(data?.data)
    ? data.data.map(fromServer)
    : []
  return { data: list }
}

// Admin: list categories with pagination/filtering
export async function getAdminCategories(params?: { search?: string; page?: number; limit?: number; sort?: string }) {
  const { data } = await api.get('/admin/categories', { params })
  const list: Category[] = Array.isArray(data)
    ? data.map(fromServer)
    : Array.isArray(data?.data)
    ? data.data.map(fromServer)
    : []
  return { data: list, page: data?.page, limit: data?.limit, total: data?.total, totalPages: data?.totalPages }
}

export async function createCategory(name: string) {
  const { data } = await api.post('/admin/categories', { name })
  return fromServer(data)
}

export async function updateCategory(id: string, name: string) {
  const { data } = await api.put(`/admin/categories/${id}`, { name })
  return fromServer(data)
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete(`/admin/categories/${id}`)
  return data as { message: string }
}
