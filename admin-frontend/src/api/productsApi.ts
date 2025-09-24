import api from './axios'

export type Product = {
  _id: string
  name: string
  category?: string // resolved name from server
  categoryId?: string
  price: number
  stock: number
  imageUrl?: string
  images?: string[]
  videos?: string[]
  description?: string
  isOrganic?: boolean
  farmerId?: string
  // unit fields
  g?: number
  pieces?: number
  litre?: number
  // computed virtuals from backend
  unitLabel?: string | null
  priceForUnitLabel?: string | null
  pricePerKg?: number | null
  pricePerPiece?: number | null
}

export async function getProducts(params?: { page?: number; limit?: number; search?: string; lowStock?: boolean; threshold?: number }) {
  const resp = await api.get('/products', { params })
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
  return { data: list, page: d?.page, limit: d?.limit, total: d?.total, totalPages: d?.totalPages }
}

export type CreateProductInput = {
  name: string
  categoryId: string
  price: number
  stock: number
  description?: string
  isOrganic?: boolean
  images?: File[]
  videos?: File[]
  g?: number
  pieces?: number
  litre?: number
}

export async function createProduct(input: CreateProductInput | FormData) {
  const form = input instanceof FormData ? input : (() => {
    const f = new FormData()
    f.append('name', input.name)
  if (input.categoryId) f.append('categoryId', input.categoryId)
    f.append('price', String(input.price))
    f.append('stock', String(input.stock))
  if (input.description) f.append('description', input.description)
  if (typeof input.isOrganic === 'boolean') f.append('isOrganic', String(input.isOrganic))
    // Prefer only one of g, pieces, or litre
  const gVal = typeof input.g === 'number' ? input.g : undefined
  const pVal = typeof input.pieces === 'number' ? input.pieces : undefined
  const lVal = typeof input.litre === 'number' ? input.litre : undefined
  if ((gVal ?? 0) > 0 && !(pVal && pVal > 0) && !(lVal && lVal > 0)) f.append('g', String(gVal))
  if ((pVal ?? 0) > 0 && !(gVal && gVal > 0) && !(lVal && lVal > 0)) f.append('pieces', String(pVal))
  if ((lVal ?? 0) > 0 && !(gVal && gVal > 0) && !(pVal && pVal > 0)) f.append('litre', String(lVal))
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
    // Prefer only one of g, pieces, or litre
    const g = (input as any).g
    const pieces = (input as any).pieces
    const litre = (input as any).litre
    if ((g ?? 0) > 0 && !(pieces && pieces > 0) && !(litre && litre > 0)) {
      f.set('g', String(g))
      f.delete('pieces')
      f.delete('litre')
    }
    if ((pieces ?? 0) > 0 && !(g && g > 0) && !(litre && litre > 0)) {
      f.set('pieces', String(pieces))
      f.delete('g')
      f.delete('litre')
    }
    if ((litre ?? 0) > 0 && !(g && g > 0) && !(pieces && pieces > 0)) {
      f.set('litre', String(litre))
      f.delete('g')
      f.delete('pieces')
    }
    return f
  })()
  const { data } = await api.put(`/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as { success: boolean }
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`)
  return data as { success: boolean }
}
