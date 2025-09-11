import api from './axios'

export type Coupon = {
  _id: string
  code: string
  type: 'percent' | 'flat'
  value: number
  startAt?: string
  endAt?: string
  usageLimit?: number
  usedCount?: number
  minAmount?: number
  maxDiscount?: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

// Map server -> client shape (supports `_id` or `id`, flat or wrapped under `data`)
const fromServer = (raw: any): Coupon => {
  let c = raw
  if (!raw?._id && !raw?.id) {
    c = raw?.data ?? raw?.coupon ?? raw?.result ?? raw?.item ?? raw
  }
  const id = c?._id || c?.id
  return {
    _id: id,
    code: c?.code,
    type: c?.discountType === 'percentage' ? 'percent' : 'flat',
    value: c?.discountValue,
    startAt: c?.startsAt || undefined,
    endAt: c?.expiresAt || undefined,
    usageLimit: c?.usageLimit ?? undefined,
    usedCount: c?.usageCount ?? undefined,
    minAmount: c?.minOrderValue ?? undefined,
    maxDiscount: c?.maxDiscount ?? undefined,
    active: !!c?.isActive,
    createdAt: c?.createdAt,
    updatedAt: c?.updatedAt,
  }
}

// Map client -> server shape
const toServer = (b: Partial<Coupon>) => {
  const toISO = (d?: string) => {
    if (!d) return undefined
    const dt = new Date(d)
    return isNaN(dt.getTime()) ? undefined : dt.toISOString()
  }
  const payload: Record<string, any> = {
    code: b.code?.toString().trim().toUpperCase(),
  // Backend enum: ['percentage','flat']
  discountType: b.type === 'percent' ? 'percentage' : 'flat',
    discountValue: typeof b.value === 'number' ? b.value : (b.value != null ? Number(b.value) : undefined),
    startsAt: toISO(b.startAt),
    expiresAt: toISO(b.endAt),
    usageLimit: typeof b.usageLimit === 'number' ? b.usageLimit : (b.usageLimit != null ? Number(b.usageLimit) : undefined),
    minOrderValue: typeof b.minAmount === 'number' ? b.minAmount : (b.minAmount != null ? Number(b.minAmount) : undefined),
    maxDiscount: typeof b.maxDiscount === 'number' ? b.maxDiscount : (b.maxDiscount != null ? Number(b.maxDiscount) : undefined),
    isActive: typeof b.active === 'boolean' ? b.active : undefined,
  }
  // prune undefined
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])
  return payload
}

export const getCoupons = async (params?: { code?: string; active?: boolean; page?: number; limit?: number }) => {
  const query: any = { ...params }
  if (Object.prototype.hasOwnProperty.call(query, 'active')) {
    query.isActive = query.active
    delete query.active
  }
  const res = await api.get('/admin/coupons', { params: query })
  const d = res.data
  const rawList = Array.isArray(d)
    ? d
    : Array.isArray(d?.data)
    ? d.data
    : Array.isArray(d?.coupons)
    ? d.coupons
    : Array.isArray(d?.items)
    ? d.items
    : []
  const list: Coupon[] = (rawList as any[]).map(fromServer).filter((x: Coupon) => x && x._id)
  list.sort((a: Coupon, b: Coupon) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()))
  return { data: list, page: d?.page, limit: d?.limit, total: d?.total, totalPages: d?.totalPages }
}

export const createCoupon = async (body: Partial<Coupon>) => {
  const res = await api.post('/admin/coupons', toServer(body))
  return fromServer(res.data)
}

export const updateCoupon = async (id: string, body: Partial<Coupon>) => {
  const res = await api.put(`/admin/coupons/${id}`, toServer(body))
  return fromServer(res.data)
}

export const deleteCoupon = async (id: string) => (await api.delete(`/admin/coupons/${id}`)).data as { message: string }
