import api from './axios'

export type DeliverySettings = {
  _id?: string
  enabled: boolean
  deliveryFee: number
  freeDeliveryThreshold: number
  minOrderSubtotal: number
  updatedAt?: string
}

const fromServer = (raw: any): DeliverySettings => {
  const d = raw?.data ?? raw
  return {
    _id: d?._id,
    enabled: !!d?.enabled,
    deliveryFee: Number(d?.deliveryFee ?? 0),
    freeDeliveryThreshold: Number(d?.freeDeliveryThreshold ?? 0),
  minOrderSubtotal: Number(d?.minOrderSubtotal ?? 0),
    updatedAt: d?.updatedAt,
  }
}

export async function getAdminDeliverySettings() {
  const { data } = await api.get('/admin/delivery-settings')
  return fromServer(data)
}

export async function updateAdminDeliverySettings(body: Partial<DeliverySettings>) {
  const payload: any = {}
  if (typeof body.enabled === 'boolean') payload.enabled = body.enabled
  if (typeof body.deliveryFee === 'number') payload.deliveryFee = body.deliveryFee
  if (typeof body.freeDeliveryThreshold === 'number') payload.freeDeliveryThreshold = body.freeDeliveryThreshold
  if (typeof body.minOrderSubtotal === 'number') payload.minOrderSubtotal = body.minOrderSubtotal
  const { data } = await api.put('/admin/delivery-settings', payload)
  return fromServer(data)
}

export async function getPublicDeliverySettings() {
  const { data } = await api.get('/public/settings/delivery')
  return fromServer(data)
}
