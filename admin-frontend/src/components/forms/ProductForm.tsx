import { useState } from 'react'

export type ProductFormValues = {
  name: string
  category?: string
  price: number
  stock: number
  description?: string
  isOrganic?: boolean
  images?: File[]
  videos?: File[]
}

export default function ProductForm({ initial, onSubmit, submitting }: { initial?: Partial<ProductFormValues>; onSubmit: (v: ProductFormValues) => void; submitting?: boolean }) {
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name || '',
    category: initial?.category || '',
    price: initial?.price || 0,
    stock: initial?.stock || 0,
    description: initial?.description || '',
    isOrganic: initial?.isOrganic || false,
    images: [],
    videos: [],
  })

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(values)
      }}
    >
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input className="w-full border px-3 py-2 rounded" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Category</label>
          <input className="w-full border px-3 py-2 rounded" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Price</label>
          <input type="number" step="0.01" className="w-full border px-3 py-2 rounded" value={values.price} onChange={(e) => setValues({ ...values, price: parseFloat(e.target.value) })} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Stock</label>
          <input type="number" className="w-full border px-3 py-2 rounded" value={values.stock} onChange={(e) => setValues({ ...values, stock: parseInt(e.target.value || '0') })} required />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input id="isOrganic" type="checkbox" checked={values.isOrganic} onChange={(e) => setValues({ ...values, isOrganic: e.target.checked })} />
          <label htmlFor="isOrganic">Organic</label>
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea className="w-full border px-3 py-2 rounded" rows={3} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setValues({ ...values, images: Array.from(e.target.files || []) })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Videos</label>
          <input type="file" multiple accept="video/*" onChange={(e) => setValues({ ...values, videos: Array.from(e.target.files || []) })} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60" disabled={submitting}>Save</button>
      </div>
    </form>
  )
}
