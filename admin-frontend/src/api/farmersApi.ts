import api from './axios'

export type Farmer = {
  _id: string
  name: string
  phone?: string
  address?: string
  farmName?: string
  farmDescription?: string
  images?: string[]
  videos?: string[]
  imageUrl?: string
  imagesPublicIds?: string[]
  videosPublicIds?: string[]
  createdAt?: string
  updatedAt?: string
}

function normalizeFarmer(item: any): Farmer {
  const images: string[] = Array.isArray(item?.images)
    ? item.images
    : Array.isArray(item?.farmImages)
      ? item.farmImages
      : []
  const videos: string[] = Array.isArray(item?.videos)
    ? item.videos
    : Array.isArray(item?.farmVideos)
      ? item.farmVideos
      : []
  const imagesPublicIds: string[] = Array.isArray(item?.imagesPublicIds)
    ? item.imagesPublicIds
    : Array.isArray(item?.farmImagesPublicIds)
      ? item.farmImagesPublicIds
      : []
  const videosPublicIds: string[] = Array.isArray(item?.videosPublicIds)
    ? item.videosPublicIds
    : Array.isArray(item?.farmVideosPublicIds)
      ? item.farmVideosPublicIds
      : []
  const imageUrl: string | undefined = item?.imageUrl || item?.farmImageUrl || images[0]
  return {
    ...item,
    images,
    videos,
    imagesPublicIds,
    videosPublicIds,
    imageUrl,
  }
}

export async function getFarmers(params?: { page?: number; limit?: number; q?: string }) {
  const { data } = await api.get('/admin/farmers', { params })
  const rawList: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
      ? (data as any).data
      : Array.isArray((data as any)?.farmers)
        ? (data as any).farmers
        : Array.isArray((data as any)?.items)
          ? (data as any).items
          : []
  // Normalize item fields to align with frontend shape
  const list: Farmer[] = rawList.map(normalizeFarmer)
  const page = Number((data as any)?.page) || 1
  const limit = Number((data as any)?.limit ?? (data as any)?.perPage) || (params?.limit || 10)
  const total = Number((data as any)?.total ?? (data as any)?.count ?? (data as any)?.meta?.total ?? list.length) || list.length
  const totalPages = Number((data as any)?.totalPages) || Math.max(1, Math.ceil(total / (limit || 1)))
  return { data: list, page, limit, total, totalPages }
}

export async function getFarmer(id: string) {
  const { data } = await api.get(`/admin/farmers/${id}`)
  // Some APIs may return { data: {...} }
  const item = (data && typeof data === 'object' && (data as any).data) ? (data as any).data : data
  return normalizeFarmer(item)
}
export type UpsertFarmerInput = {
  name: string
  phone?: string
  address?: string
  farmName?: string
  farmDescription?: string
  images?: File[]
  videos?: File[]
  removeImages?: string[]
  removeVideos?: string[]
  imagesOrder?: string[]
  videosOrder?: string[]
}

function toFormData(input: UpsertFarmerInput) {
  const fd = new FormData()
  if (input.name) fd.append('name', input.name)
  if (input.phone) fd.append('phone', input.phone)
  if (input.address) fd.append('address', input.address)
  if (input.farmName) fd.append('farmName', input.farmName)
  if (input.farmDescription) fd.append('farmDescription', input.farmDescription)
  input.images?.forEach((f) => fd.append('images', f))
  input.videos?.forEach((f) => fd.append('videos', f))
  input.removeImages?.forEach((u) => fd.append('removeImages', u))
  input.removeVideos?.forEach((u) => fd.append('removeVideos', u))
  input.imagesOrder?.forEach((u) => fd.append('imagesOrder', u))
  input.videosOrder?.forEach((u) => fd.append('videosOrder', u))
  return fd
}

export async function createFarmer(input: UpsertFarmerInput) {
  const formData = input instanceof FormData ? input : toFormData(input)
  const { data } = await api.post('/admin/farmers', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as Farmer
}

export async function updateFarmer(id: string, input: UpsertFarmerInput | FormData) {
  const formData = input instanceof FormData ? input : toFormData(input)
  const { data } = await api.put(`/admin/farmers/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  return data as Farmer
}

export async function deleteFarmer(id: string) {
  const { data } = await api.delete(`/admin/farmers/${id}`)
  return data as { success: boolean }
}
