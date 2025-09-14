import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getAdminCategories, createCategory, updateCategory, deleteCategory, type Category } from '@/api/categoriesApi'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'

export default function Categories() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchParams, setSearchParams] = useSearchParams()
  const PAGE_SIZE_KEY = 'pageSize:categories'
  const [total, setTotal] = useState<number | undefined>(undefined)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAdminCategories({ page, limit, sort: 'name' })
      setItems(res.data)
      setTotal(res.total)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, limit])

  // Initialize limit from URL or localStorage
  useEffect(() => {
    const fromUrl = Number(searchParams.get('limit'))
    if (Number.isFinite(fromUrl) && fromUrl > 0) { setLimit(fromUrl); return }
    const fromLS = Number(localStorage.getItem(PAGE_SIZE_KEY) || '')
    if (Number.isFinite(fromLS) && fromLS > 0) setLimit(fromLS)
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
  const created = await createCategory(name.trim())
      setItems((prev) => {
        const next = [created, ...prev]
        next.sort((a, b) => a.name.localeCompare(b.name))
        return next
      })
      setName('')
      setOpenAdd(false)
      toast.success('Category created')
  // Notify other parts of the app to refresh categories (e.g., ProductForm dropdowns)
  window.dispatchEvent(new CustomEvent('categories:updated'))
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || 'Create failed'
      if (status === 409) toast.error('Category already exists')
      else toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    if (!editName.trim()) return
    setSubmitting(true)
    try {
  const updated = await updateCategory(editing._id, editName.trim())
      setItems((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
      setEditing(null)
      toast.success('Category updated')
  window.dispatchEvent(new CustomEvent('categories:updated'))
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || 'Update failed'
      if (status === 409) toast.error('Category already exists')
      else if (status === 404) toast.error('Category not found')
      else toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (c: Category) => {
    if (!confirm(`Delete category "${c.name}"?`)) return
    try {
  await deleteCategory(c._id)
      setItems((prev) => prev.filter((x) => x._id !== c._id))
      toast.success('Category deleted')
  window.dispatchEvent(new CustomEvent('categories:updated'))
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message || 'Delete failed'
      if (status === 404) toast.error('Category not found')
      else toast.error(msg)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <span>Per page</span>
            <select
              className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600"
              value={limit}
              onChange={(e) => {
                const val = Number(e.target.value)
                setLimit(val)
                setPage(1)
                localStorage.setItem(PAGE_SIZE_KEY, String(val))
                const next = new URLSearchParams(searchParams)
                next.set('limit', String(val))
                next.set('page', '1')
                setSearchParams(next, { replace: true })
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button onClick={() => setOpenAdd(true)} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Category</button>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState title="No categories" message="Create your first category." action={<button onClick={() => setOpenAdd(true)} className="px-4 py-2 bg-green-600 text-white rounded">Add Category</button>} />
      ) : (
  <>
  <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Slug</TH>
              <TH>&nbsp;</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((c, i) => (
              <TR key={c._id || c.slug || i}>
                <TD>{c.name}</TD>
                <TD>{c.slug}</TD>
                <TD>
                  <div className="flex gap-2 justify-end">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => { setEditing(c); setEditName(c.name) }}>Rename</button>
                    <button className="px-2 py-1 border rounded text-red-600 hover:bg-red-50" onClick={() => onDelete(c)}>Delete</button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
  </Table>
  <Pagination page={page} limit={limit} total={total} onPageChange={(p) => setPage(Math.max(1, p))} />
  </>
      )}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Category">
        <form onSubmit={onCreate} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-3 py-2 border rounded hover:bg-gray-50" onClick={() => setOpenAdd(false)}>Cancel</button>
            <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-60" disabled={submitting}>Save</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Rename Category">
        {editing && (
          <form onSubmit={onUpdate} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-2 border rounded hover:bg-gray-50" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-60" disabled={submitting}>Save</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
