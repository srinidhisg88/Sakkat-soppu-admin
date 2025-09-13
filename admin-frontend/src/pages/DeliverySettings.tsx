import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DeliverySettings, getAdminDeliverySettings, updateAdminDeliverySettings } from '@/api/settingsApi'

export default function DeliverySettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<DeliverySettings>({ enabled: false, deliveryFee: 0, freeDeliveryThreshold: 0, minOrderSubtotal: 0 })

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAdminDeliverySettings()
      setForm((f) => ({ ...f, ...data }))
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load settings')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!Number.isFinite(form.deliveryFee) || form.deliveryFee < 0) {
      toast.error('Delivery fee must be 0 or more')
      return
    }
    if (!Number.isFinite(form.freeDeliveryThreshold) || form.freeDeliveryThreshold < 0) {
      toast.error('Free delivery threshold must be 0 or more')
      return
    }
    if (!Number.isFinite(form.minOrderSubtotal) || form.minOrderSubtotal < 0) {
      toast.error('Minimum order subtotal must be 0 or more')
      return
    }
    setSaving(true)
    try {
      const updated = await updateAdminDeliverySettings({
        enabled: form.enabled,
        deliveryFee: Number(form.deliveryFee),
        freeDeliveryThreshold: Number(form.freeDeliveryThreshold),
        minOrderSubtotal: Number(form.minOrderSubtotal),
      })
      setForm((f) => ({ ...f, ...updated }))
      toast.success('Settings updated')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update settings')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Delivery Settings</h1>
        <button disabled={saving} onClick={save} className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="bg-white border rounded p-6 max-w-xl">
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <input id="enabled" type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={!!form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              />
              <label htmlFor="enabled" className="text-sm">Enable delivery fee</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Delivery fee (₹)</label>
              <input type="number" min={0} className="w-full max-w-xs rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.deliveryFee}
                onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">Flat fee applied to orders when enabled.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Free delivery threshold (₹)</label>
              <input type="number" min={0} className="w-full max-w-xs rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.freeDeliveryThreshold}
                onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">Orders at or above this total skip the delivery fee.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Minimum order subtotal (₹)</label>
              <input type="number" min={0} className="w-full max-w-xs rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.minOrderSubtotal}
                onChange={(e) => setForm({ ...form, minOrderSubtotal: Number(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">Orders below this subtotal cannot be placed.</p>
            </div>

            {form.updatedAt && (
              <div className="text-xs text-gray-500">Last updated: {new Date(form.updatedAt).toLocaleString()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
