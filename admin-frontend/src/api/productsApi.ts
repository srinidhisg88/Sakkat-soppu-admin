import api from './axios'

export type Product = {
  _id: string
  name: string
  category?: string
  price: number
  stock: number
  imageUrl?: string
  images?: string[]
  videos?: string[]
  description?: string
  isOrganic?: boolean
  farmerId?: string
}

export async function getProducts() {
  const resp = await api.get('/products')
  const d = resp.data
  // Normalize to { data: Product[] } supporting common shapes
  const list: Product[] = Array.isArray(d)
    ? d
    : Array.isArray(d?.data)
    ? d.data
    : Array.isArray(d?.products)
    ? d.products
    : Array.isArray(d?.items)
    ? d.items
    : []
  return { data: list }
}

export type CreateProductInput = {
  name: string
  category?: string
  price: number
  stock: number
  description?: string
  isOrganic?: boolean
  images?: File[]
  videos?: File[]
}

export async function createProduct(input: CreateProductInput | FormData) {
  const form = input instanceof FormData ? input : (() => {
    const f = new FormData()
    f.append('name', input.name)
    if (input.category) f.append('category', input.category)
    f.append('price', String(input.price))
    f.append('stock', String(input.stock))
  if (input.description) f.append('description', input.description)
  if (typeof input.isOrganic === 'boolean') f.append('isOrganic', String(input.isOrganic))
  input.images?.forEach((file) => f.append('images', file))
  input.videos?.forEach((file) => f.append('videos', file))
    return f
  })()
  const { data } = await api.post('/products', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as { success: boolean }
}

export type UpdateProductInput = Partial<CreateProductInput>

export async function updateProduct(id: string, input: UpdateProductInput | FormData) {
  const form = input instanceof FormData ? input : (() => {
    const f = new FormData()
    Object.entries(input).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (k === 'images' || k === 'videos') {
        ;(v as File[]).forEach((file) => f.append(k, file))
      } else {
        f.append(k, typeof v === 'boolean' ? String(v) : String(v))
      }
    })
    return f
  })()
  const { data } = await api.put(`/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as { success: boolean }
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`)
  return data as { success: boolean }
}
