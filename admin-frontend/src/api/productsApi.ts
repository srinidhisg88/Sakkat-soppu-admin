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
  const { data } = await api.get('/products')
  return data as { data: Product[] }
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

export async function createProduct(input: CreateProductInput) {
  const form = new FormData()
  form.append('name', input.name)
  if (input.category) form.append('category', input.category)
  form.append('price', String(input.price))
  form.append('stock', String(input.stock))
  if (input.description) form.append('description', input.description)
  if (typeof input.isOrganic === 'boolean') form.append('isOrganic', String(input.isOrganic))
  input.images?.forEach((f) => form.append('images[]', f))
  input.videos?.forEach((f) => form.append('videos[]', f))
  const { data } = await api.post('/products', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as { success: boolean }
}

export type UpdateProductInput = Partial<CreateProductInput> & { id: string }

export async function updateProduct({ id, ...rest }: UpdateProductInput) {
  const form = new FormData()
  Object.entries(rest).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (k === 'images' || k === 'videos') {
      ;(v as File[]).forEach((f) => form.append(`${k}[]`, f))
    } else {
      form.append(k, typeof v === 'boolean' ? String(v) : String(v))
    }
  })
  const { data } = await api.put(`/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as { success: boolean }
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`)
  return data as { success: boolean }
}
