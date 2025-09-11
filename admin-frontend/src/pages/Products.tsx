import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import MediaSlider from '@/components/ui/MediaSlider'
import ProductForm from '@/components/forms/ProductForm'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from '@/api/productsApi'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showLow, setShowLow] = useState(false)
  const [viewMediaOf, setViewMediaOf] = useState<Product | null>(null)
  const LOW_STOCK_THRESHOLD = 10
  const filtered = products

  const load = async () => {
    setLoading(true)
    try {
      const res = await getProducts(showLow ? { lowStock: true, threshold: LOW_STOCK_THRESHOLD } : undefined)
      setProducts(res.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { load() }, [showLow])

  const onCreate = async (formData: FormData) => {
    setSubmitting(true)
    try {
    await createProduct(formData)
      toast.success('Product created')
      setOpenAdd(false)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onUpdate = async (formData: FormData) => {
    if (!editProduct) return
    setSubmitting(true)
    try {
    await updateProduct(editProduct._id, formData)
      toast.success('Product updated')
      setEditProduct(null)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (p: Product) => {
    if (!confirm(`Delete product "${p.name}"?`)) return
    try {
      await deleteProduct(p._id)
      toast.success('Deleted')
      setProducts((ps) => ps.filter((x) => x._id !== p._id))
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" checked={showLow} onChange={(e) => setShowLow(e.target.checked)} />
            Show low stock (≤ {LOW_STOCK_THRESHOLD})
          </label>
          <button onClick={() => setOpenAdd(true)} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 active:bg-green-800 transition-colors">Add Product</button>
        </div>
      </div>
      {loading ? (
        <div className="p-4">
          <div className="bg-white border rounded shadow-sm p-4">
            <div className="grid grid-cols-4 gap-4 mb-3">
              <Skeleton className="col-span-1" />
              <Skeleton className="col-span-1" />
              <Skeleton className="col-span-1" />
              <Skeleton className="col-span-1" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        filtered.length === 0 ? (
          <EmptyState
            title="No products yet"
            message="Create your first product to get started."
            action={<button onClick={() => setOpenAdd(true)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Product</button>}
          />
        ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Media</TH>
              <TH>Stock</TH>
              <TH>Price</TH>
              <TH>&nbsp;</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((p) => (
              <TR key={p._id}>
                <TD>{p.name}</TD>
                <TD>
                  <div className="flex items-center gap-2 justify-start">
                    {p.images?.slice(0, 3).map((src, i) => (
                      <img key={i} src={src} alt="img" className="w-10 h-10 rounded object-cover border" />
                    ))}
                    {p.videos?.slice(0, 1).map((src, i) => (
                      <div key={i} className="w-10 h-10 rounded bg-black/70 text-white text-[10px] flex items-center justify-center">Video</div>
                    ))}
                    {(p.images?.length || 0) + (p.videos?.length || 0) > 0 && (
                      <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50" onClick={() => setViewMediaOf(p)}>View</button>
                    )}
                  </div>
                </TD>
                <TD>{p.stock}</TD>
                <TD>
                  {p.priceForUnitLabel ? (
                    <span>Rs {p.priceForUnitLabel}</span>
                  ) : (
                    <span>Rs {p.price.toFixed(2)}</span>
                  )}
                </TD>
                <TD>
                  <div className="flex gap-2 justify-end">
                    <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => setEditProduct(p)}>Edit</button>
                    <button className="px-2 py-1 border rounded text-red-600 hover:bg-red-50" onClick={() => onDelete(p)}>Delete</button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>)
      )}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Product">
        <ProductForm onSubmit={onCreate} submitting={submitting} />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        {editProduct && (
          <ProductForm
            initial={{
              name: editProduct.name,
              categoryId: (editProduct as any).categoryId || '',
              price: editProduct.price,
              stock: editProduct.stock,
              description: editProduct.description,
              isOrganic: editProduct.isOrganic,
              g: (editProduct as any).g,
              pieces: (editProduct as any).pieces,
            }}
            onSubmit={onUpdate}
            submitting={submitting}
          />
        )}
      </Modal>

      <Modal open={!!viewMediaOf} onClose={() => setViewMediaOf(null)} title={viewMediaOf ? `Media: ${viewMediaOf.name}` : 'Media'}>
        {viewMediaOf && (
          <MediaSlider
            items={[
              ...(viewMediaOf.images || []).map((src) => ({ type: 'image' as const, src })),
              ...(viewMediaOf.videos || []).map((src) => ({ type: 'video' as const, src })),
            ]}
          />
        )}
      </Modal>
    </div>
  )
}
