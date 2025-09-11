import { useState } from 'react'

export type FarmerFormValues = {
  name: string
  email: string
  password?: string
  phone?: string
  address?: string
  farmName?: string
  farmDescription?: string
  latitude?: number
  longitude?: number
}

export default function FarmerForm({ initial, onSubmit, submitting }: { initial?: Partial<FarmerFormValues>; onSubmit: (v: FarmerFormValues) => void; submitting?: boolean }) {
  const [values, setValues] = useState<FarmerFormValues>({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    phone: initial?.phone || '',
    address: initial?.address || '',
    farmName: initial?.farmName || '',
    farmDescription: initial?.farmDescription || '',
    latitude: initial?.latitude,
    longitude: initial?.longitude,
  })

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(values)
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input type="email" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.password || ''} onChange={(e) => setValues({ ...values, password: e.target.value })} placeholder="Set only when creating or changing" />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.phone || ''} onChange={(e) => setValues({ ...values, phone: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Address</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.address || ''} onChange={(e) => setValues({ ...values, address: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Farm Name</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.farmName || ''} onChange={(e) => setValues({ ...values, farmName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Farm Description</label>
          <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.farmDescription || ''} onChange={(e) => setValues({ ...values, farmDescription: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Latitude</label>
          <input type="number" step="any" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.latitude ?? ''} onChange={(e) => setValues({ ...values, latitude: e.target.value ? parseFloat(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Longitude</label>
          <input type="number" step="any" className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={values.longitude ?? ''} onChange={(e) => setValues({ ...values, longitude: e.target.value ? parseFloat(e.target.value) : undefined })} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60 hover:bg-green-700 active:bg-green-800 transition-colors" disabled={submitting}>Save</button>
      </div>
    </form>
  )
}
