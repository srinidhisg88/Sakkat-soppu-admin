import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Modal from '@/components/ui/Modal'
import Skeleton from '@/components/ui/Skeleton'
import FarmerForm from '@/components/forms/FarmerForm'
import { getFarmers, createFarmer, updateFarmer, deleteFarmer, Farmer } from '@/api/farmersApi'
import EmptyState from '@/components/ui/EmptyState'
import MediaSlider from '@/components/ui/MediaSlider'

export default function Farmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [editFarmer, setEditFarmer] = useState<Farmer | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchParams, setSearchParams] = useSearchParams()
  const PAGE_SIZE_KEY = 'pageSize:farmers'
  const [total, setTotal] = useState<number | undefined>(undefined)
  const [previewFarmer, setPreviewFarmer] = useState<Farmer | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getFarmers({ page, limit })
      const list = Array.isArray((res as any)?.data) ? (res as any).data : []
      setFarmers(list)
      setTotal(typeof (res as any)?.total === 'number' ? (res as any).total : list.length)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load farmers')
      setFarmers([])
      setTotal(0)
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

  const onCreate = async (values: FormData) => {
    setSubmitting(true)
    try {
      await createFarmer(values as any)
      toast.success('Farmer created')
      setOpenAdd(false)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onUpdate = async (values: FormData) => {
    if (!editFarmer) return
    setSubmitting(true)
    try {
      await updateFarmer(editFarmer._id, values as any)
      toast.success('Farmer updated')
      setEditFarmer(null)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (f: Farmer) => {
    if (!confirm(`Delete farmer "${f.name}"?`)) return
    try {
      await deleteFarmer(f._id)
      toast.success('Deleted')
      setFarmers((fs) => fs.filter((x) => x._id !== f._id))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Farmers</h1>
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
          <button onClick={() => setOpenAdd(true)} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 active:bg-green-800 transition-colors">Add Farmer</button>
        </div>
      </div>
      {loading ? (
        <div className="p-4">
          <div className="bg-white border rounded shadow-sm p-4">
            <div className="grid grid-cols-5 gap-4 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        (!Array.isArray(farmers) || farmers.length === 0) ? (
          <EmptyState
            title="No farmers found"
            message="Add a farmer to start managing suppliers."
            action={<button onClick={() => setOpenAdd(true)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Farmer</button>}
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Media</TH>
                  <TH>Name</TH>
                  <TH>Farm</TH>
                  <TH>Phone</TH>
                  <TH>Address</TH>
                  <TH>&nbsp;</TH>
                </TR>
              </THead>
              <TBody>
                {farmers.map((f) => {
                  const img = (f as any).imageUrl || (f as any).images?.[0]
                  return (
                    <TR key={f._id}>
                      <TD>
                        <button onClick={() => setPreviewFarmer(f)} className="group inline-flex items-center gap-2">
                          {img ? (
                            <img src={img} alt={f.name} className="h-10 w-10 object-cover rounded border group-hover:ring-2 group-hover:ring-green-600" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400">N/A</div>
                          )}
                          {(Array.isArray((f as any).videos) && (f as any).videos.length > 0) && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 border text-gray-700">{(f as any).videos.length} media</span>
                          )}
                        </button>
                      </TD>
                      <TD className="font-medium">{f.name}</TD>
                      <TD>
                        <div className="max-w-[260px]">
                          <div className="truncate">{(f as any).farmName || '-'}</div>
                          {Boolean((f as any).farmDescription) && (
                            <div className="text-xs text-gray-500 truncate">{(f as any).farmDescription}</div>
                          )}
                        </div>
                      </TD>
                      <TD>{f.phone || '-'}</TD>
                      <TD>
                        <div className="max-w-[280px] truncate">{(f as any).address || '-'}</div>
                      </TD>
                      <TD>
                        <div className="flex gap-2 justify-end">
                          <Link to={`/farmers/${f._id}`} className="px-2 py-1 border rounded hover:bg-gray-50">View</Link>
                          <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => setEditFarmer(f)}>Edit</button>
                          <button className="px-2 py-1 border rounded text-red-600 hover:bg-red-50" onClick={() => onDelete(f)}>Delete</button>
                        </div>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
            <Pagination page={page} limit={limit} total={total} onPageChange={(p) => setPage(Math.max(1, p))} />
            <Modal open={!!previewFarmer} onClose={() => setPreviewFarmer(null)} title={previewFarmer?.name ? `${previewFarmer.name} — Media` : 'Media'} size="xl">
              {previewFarmer && (
                <MediaSlider
                  items={[
                    ...((previewFarmer.images || []).map((src) => ({ type: 'image' as const, src }))),
                    ...((previewFarmer.videos || []).map((src) => ({ type: 'video' as const, src }))),
                  ]}
                />
              )}
            </Modal>
          </>
        )
      )}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Farmer" size="full">
        <FarmerForm onSubmit={onCreate} submitting={submitting} />
      </Modal>

      <Modal open={!!editFarmer} onClose={() => setEditFarmer(null)} title="Edit Farmer" size="full">
        {editFarmer && (
          <FarmerForm
            initial={{
              name: editFarmer.name,
              phone: editFarmer.phone,
              address: editFarmer.address,
              farmName: editFarmer.farmName,
              farmDescription: editFarmer.farmDescription,
            }}
            initialExistingImages={editFarmer.images || []}
            initialExistingVideos={editFarmer.videos || []}
            onSubmit={onUpdate}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  )
}
