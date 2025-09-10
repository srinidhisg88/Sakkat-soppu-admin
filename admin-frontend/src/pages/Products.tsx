import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import ProductForm, { ProductFormValues } from '@/components/forms/ProductForm'
import Loader from '@/components/ui/Loader'
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from '@/api/productsApi'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getProducts()
      setProducts(res.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (values: ProductFormValues) => {
    setSubmitting(true)
    try {
      await createProduct(values)
      toast.success('Product created')
      setOpenAdd(false)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onUpdate = async (values: ProductFormValues) => {
    if (!editProduct) return
    setSubmitting(true)
    try {
      await updateProduct({ id: editProduct._id, ...values })
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
        <button onClick={() => setOpenAdd(true)} className="px-3 py-2 bg-green-600 text-white rounded">Add Product</button>
      </div>
      {loading ? (
        <div className="p-8 flex justify-center"><Loader /></div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>ID</TH>
              <TH>Name</TH>
              <TH>Stock</TH>
              <TH>Price</TH>
              <TH>&nbsp;</TH>
            </TR>
          </THead>
          <TBody>
            {products.map((p) => (
              <TR key={p._id}>
                <TD className="font-mono">{p._id}</TD>
                <TD>{p.name}</TD>
                <TD>{p.stock}</TD>
                <TD>₹{p.price.toFixed(2)}</TD>
                <TD>
                  <div className="flex gap-2 justify-end">
                    <button className="px-2 py-1 border rounded" onClick={() => setEditProduct(p)}>Edit</button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => onDelete(p)}>Delete</button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Product">
        <ProductForm onSubmit={onCreate} submitting={submitting} />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        {editProduct && (
          <ProductForm
            initial={{
              name: editProduct.name,
              category: editProduct.category,
              price: editProduct.price,
              stock: editProduct.stock,
              description: editProduct.description,
              isOrganic: editProduct.isOrganic,
            }}
            onSubmit={onUpdate}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  )
}
