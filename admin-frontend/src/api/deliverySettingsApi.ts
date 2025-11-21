import api from './axios'

export type CityDeliverySettings = {
  name: string
  basePrice: number
  pricePerKg: number
  freeDeliveryThreshold?: number
}

export type DeliverySettings = {
  _id?: string
  enabled: boolean
  minOrderSubtotal: number
  cities: CityDeliverySettings[]
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export async function getDeliverySettings() {
  const { data } = await api.get<DeliverySettings>('/admin/delivery-settings')
  return data
}

export async function updateDeliverySettings(settings: Partial<DeliverySettings>) {
  const { data } = await api.put<DeliverySettings>('/admin/delivery-settings', settings)
  return data
}

export async function updateCitySettings(cityName: string, citySettings: Omit<CityDeliverySettings, 'name'>) {
  const { data } = await api.put<DeliverySettings>(`/admin/delivery-settings/cities/${encodeURIComponent(cityName)}`, citySettings)
  return data
}

export async function deleteCitySettings(cityName: string) {
  const { data } = await api.delete<DeliverySettings>(`/admin/delivery-settings/cities/${encodeURIComponent(cityName)}`)
  return data
}
