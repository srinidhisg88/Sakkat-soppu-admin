import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Coupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/api/couponsApi'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'

export default function Coupons() {
  const [list, setList] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Coupon | null>(null)
  const [form, setForm] = useState<Partial<Coupon>>({ type: 'percent', active: true })

  const load = async () => {
    setLoading(true)
    try {
      const res = await getCoupons()
      setList(res.data)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load coupons')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const submit = async () => {
    // basic client-side validation to avoid backend 500s on invalid input
    const code = (form.code || '').trim()
    const value = Number(form.value ?? NaN)
    if (!code) { toast.error('Code is required'); return }
    if (!Number.isFinite(value) || value <= 0) { toast.error('Value must be greater than 0'); return }
    if (form.type === 'percent' && (value <= 0 || value > 100)) { toast.error('Percent must be between 1 and 100'); return }
    if (form.startAt && form.endAt) {
      const s = new Date(form.startAt)
      const e = new Date(form.endAt)
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s > e) { toast.error('End date must be after start date'); return }
    }
    try {
      if (edit) {
        const updated = await updateCoupon(edit._id, form)
        setList((l) => l.map((c) => c._id === updated._id ? updated : c))
        toast.success('Coupon updated')
      } else {
        const created = await createCoupon(form)
        setList((l) => [created, ...l])
        toast.success('Coupon created')
      }
      setOpen(false); setEdit(null); setForm({ type: 'percent', active: true })
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Save failed'
      toast.error(msg)
    }
  }

  const remove = async (id?: string) => {
    if (!id) { toast.error('Invalid coupon id'); return }
    if (!confirm('Delete this coupon?')) return
    try {
      await deleteCoupon(id)
      setList((l) => l.filter((c) => c._id !== id))
      toast.success('Deleted')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <button className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700" onClick={() => setOpen(true)}>Add Coupon</button>
      </div>

      {loading ? <div className="text-sm text-gray-500">Loading...</div> : list.length === 0 ? (
        <div className="bg-white border rounded p-6 text-center text-gray-600">No coupons yet</div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Code</TH><TH>Type</TH><TH>Value</TH><TH>Min amount</TH><TH>Window</TH><TH>Active</TH><TH></TH>
            </TR>
          </THead>
          <TBody>
            {list.map((c) => (
              <TR key={c._id}>
                <TD className="font-medium">{c.code}</TD>
                <TD>{c.type}</TD>
                <TD>{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</TD>
                <TD>{c.minAmount !== undefined ? `₹${c.minAmount}` : '-'}</TD>
                <TD className="text-sm text-gray-600">
                  {c.startAt ? new Date(c.startAt).toLocaleDateString() : '-'} → {c.endAt ? new Date(c.endAt).toLocaleDateString() : '-'}
                </TD>
                <TD>{c.active ? 'Yes' : 'No'}</TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-2">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => { setEdit(c); setForm(c); setOpen(true) }}>Edit</button>
                    <button className="px-2 py-1 border rounded text-red-600 hover:bg-red-50" onClick={() => remove((c as any)._id || (c as any).id)}>Delete</button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal open={open} onClose={() => { setOpen(false); setEdit(null) }} title={edit ? 'Edit coupon' : 'Add coupon'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input className="w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
              value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select className="w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.type || 'percent'} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                <option value="percent">percent</option>
                <option value="flat">flat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input type="number" className="w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.value || 0} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start at</label>
              <input type="date" className="w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.startAt ? form.startAt.substring(0,10) : ''} onChange={(e) => setForm({ ...form, startAt: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End at</label>
              <input type="date" className="w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.endAt ? form.endAt.substring(0,10) : ''} onChange={(e) => setForm({ ...form, endAt: e.target.value })}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min amount</label>
              <input type="number" className="w-full rounded border-gray-300 focus:border-green-600 focus:ring-green-500"
                value={form.minAmount || 0} onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })}/>
            </div>
            <div className="flex items-end gap-2">
              <input id="active" type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })}/>
              <label htmlFor="active" className="text-sm">Active</label>
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button className="px-3 py-2 rounded-md border hover:bg-gray-50" onClick={() => { setOpen(false); setEdit(null) }}>Cancel</button>
            <button className="px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700" onClick={submit}>Save</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
