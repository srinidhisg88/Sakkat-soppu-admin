import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getDeliverySettings, updateDeliverySettings, updateCitySettings, deleteCitySettings, DeliverySettings as DeliverySettingsType, CityDeliverySettings } from '@/api/deliverySettingsApi'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

export default function DeliverySettings() {
  const [settings, setSettings] = useState<DeliverySettingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editCity, setEditCity] = useState<CityDeliverySettings | null>(null)
  const [isNewCity, setIsNewCity] = useState(false)
  const [globalEnabled, setGlobalEnabled] = useState(true)
  const [globalMinSubtotal, setGlobalMinSubtotal] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDeliverySettings()
      setSettings(data)
      setGlobalEnabled(data.enabled)
      setGlobalMinSubtotal(String(data.minOrderSubtotal || 0))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load delivery settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onUpdateGlobal = async () => {
    setSubmitting(true)
    try {
      const updated = await updateDeliverySettings({
        enabled: globalEnabled,
        minOrderSubtotal: Number(globalMinSubtotal) || 0,
      })
      setSettings(updated)
      toast.success('Global settings updated')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onSaveCity = async (cityData: CityDeliverySettings) => {
    setSubmitting(true)
    try {
      const updated = await updateCitySettings(cityData.name, {
        basePrice: cityData.basePrice,
        pricePerKg: cityData.pricePerKg,
        freeDeliveryThreshold: cityData.freeDeliveryThreshold,
      })
      setSettings(updated)
      toast.success(isNewCity ? 'City added' : 'City updated')
      setEditCity(null)
      setIsNewCity(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onDeleteCity = async (cityName: string) => {
    if (!confirm(`Delete delivery settings for "${cityName}"?`)) return
    try {
      const updated = await deleteCitySettings(cityName)
      setSettings(updated)
      toast.success('City deleted')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Delivery Settings</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white border rounded shadow-sm p-4">
            <Skeleton className="h-8 w-48 mb-3" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ) : (
        <>
          {/* Global Settings Card */}
          <div className="bg-white border rounded shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Global Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={globalEnabled}
                  onChange={(e) => setGlobalEnabled(e.target.checked)}
                />
                <span className="text-sm font-medium">Enable Delivery</span>
              </label>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Order Subtotal (Rs)
                </label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
                  value={globalMinSubtotal}
                  onChange={(e) => setGlobalMinSubtotal(e.target.value)}
                  min="0"
                />
              </div>

              <button
                onClick={onUpdateGlobal}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Global Settings'}
              </button>
            </div>
          </div>

          {/* City Settings */}
          <div className="bg-white border rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">City Delivery Settings</h2>
              <button
                onClick={() => {
                  setEditCity({
                    name: '',
                    basePrice: 0,
                    pricePerKg: 0,
                    freeDeliveryThreshold: 0,
                  })
                  setIsNewCity(true)
                }}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add City
              </button>
            </div>

            {!settings?.cities || settings.cities.length === 0 ? (
              <EmptyState
                title="No cities configured"
                message="Add your first city to start configuring delivery pricing."
                action={
                  <button
                    onClick={() => {
                      setEditCity({
                        name: '',
                        basePrice: 0,
                        pricePerKg: 0,
                        freeDeliveryThreshold: 0,
                      })
                      setIsNewCity(true)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add City
                  </button>
                }
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>City</TH>
                    <TH>Base Price (Rs)</TH>
                    <TH>Price per Kg (Rs)</TH>
                    <TH>Free Delivery Threshold (Rs)</TH>
                    <TH>&nbsp;</TH>
                  </TR>
                </THead>
                <TBody>
                  {settings.cities.map((city) => (
                    <TR key={city.name}>
                      <TD>{city.name}</TD>
                      <TD>{city.basePrice}</TD>
                      <TD>{city.pricePerKg}</TD>
                      <TD>{city.freeDeliveryThreshold || '-'}</TD>
                      <TD>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-2 py-1 border rounded hover:bg-gray-50"
                            onClick={() => {
                              setEditCity(city)
                              setIsNewCity(false)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                            onClick={() => onDeleteCity(city.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        </>
      )}

      {/* City Edit/Add Modal */}
      <Modal
        open={!!editCity}
        onClose={() => {
          setEditCity(null)
          setIsNewCity(false)
        }}
        title={isNewCity ? 'Add City' : `Edit ${editCity?.name}`}
      >
        {editCity && (
          <CityForm
            initial={editCity}
            isNewCity={isNewCity}
            onSubmit={onSaveCity}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  )
}

function CityForm({
  initial,
  isNewCity,
  onSubmit,
  submitting,
}: {
  initial: CityDeliverySettings
  isNewCity: boolean
  onSubmit: (data: CityDeliverySettings) => void
  submitting: boolean
}) {
  const [name, setName] = useState(initial.name)
  const [basePrice, setBasePrice] = useState(String(initial.basePrice || ''))
  const [pricePerKg, setPricePerKg] = useState(String(initial.pricePerKg || ''))
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    String(initial.freeDeliveryThreshold || '')
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('City name is required')
      return
    }
    if (!basePrice || Number(basePrice) < 0) {
      toast.error('Valid base price is required')
      return
    }
    if (!pricePerKg || Number(pricePerKg) < 0) {
      toast.error('Valid price per kg is required')
      return
    }

    onSubmit({
      name: name.trim(),
      basePrice: Number(basePrice),
      pricePerKg: Number(pricePerKg),
      freeDeliveryThreshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          City Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isNewCity}
          placeholder="e.g., Bengaluru"
          required
        />
        {!isNewCity && (
          <p className="text-xs text-gray-500 mt-1">City name cannot be changed</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Base Price (Rs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          min="0"
          step="0.01"
          placeholder="e.g., 40"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Price per Kg (Rs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
          min="0"
          step="0.01"
          placeholder="e.g., 10"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Free Delivery Threshold (Rs)
        </label>
        <input
          type="number"
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
          value={freeDeliveryThreshold}
          onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
          min="0"
          step="0.01"
          placeholder="e.g., 500 (leave empty for no free delivery)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Orders above this amount get free delivery. Leave empty to disable free delivery.
        </p>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : isNewCity ? 'Add City' : 'Update City'}
        </button>
      </div>
    </form>
  )
}
