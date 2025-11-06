import api from './axios'

export type HomepageVideo = {
  _id: string
  title?: string
  videoUrl: string
  videoPublicId: string
  displayOrder: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type CreateHomepageVideoInput = {
  title?: string
  video: File
  active?: boolean
}

export type UpdateHomepageVideoInput = {
  title?: string
  active?: boolean
}

export async function getHomepageVideos() {
  const { data } = await api.get('/admin/homepage-videos')
  return data as { data: HomepageVideo[], total: number }
}

export async function createHomepageVideo(input: CreateHomepageVideoInput) {
  const formData = new FormData()
  if (input.title) formData.append('title', input.title)
  formData.append('video', input.video)
  if (typeof input.active === 'boolean') formData.append('active', String(input.active))

  const { data } = await api.post('/admin/homepage-videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data as HomepageVideo
}

export async function updateHomepageVideo(id: string, input: UpdateHomepageVideoInput) {
  const { data } = await api.put(`/admin/homepage-videos/${id}`, input)
  return data as HomepageVideo
}

export async function deleteHomepageVideo(id: string) {
  const { data } = await api.delete(`/admin/homepage-videos/${id}`)
  return data as { message: string }
}

export async function reorderHomepageVideos(videoOrder: string[]) {
  const { data } = await api.put('/admin/homepage-videos/reorder', { videoOrder })
  return data as { message: string, data: HomepageVideo[] }
}