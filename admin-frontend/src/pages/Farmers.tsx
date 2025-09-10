import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import Loader from '@/components/ui/Loader'
import FarmerForm, { FarmerFormValues } from '@/components/forms/FarmerForm'
import { getFarmers, createFarmer, updateFarmer, deleteFarmer, Farmer } from '@/api/farmersApi'

export default function Farmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [editFarmer, setEditFarmer] = useState<Farmer | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getFarmers()
      setFarmers(res.data)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load farmers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (values: FarmerFormValues) => {
    setSubmitting(true)
    try {
      await createFarmer(values)
      toast.success('Farmer created')
      setOpenAdd(false)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onUpdate = async (values: FarmerFormValues) => {
    if (!editFarmer) return
    setSubmitting(true)
    try {
      await updateFarmer(editFarmer._id, values)
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
        <button onClick={() => setOpenAdd(true)} className="px-3 py-2 bg-green-600 text-white rounded">Add Farmer</button>
      </div>
      {loading ? (
        <div className="p-8 flex justify-center"><Loader /></div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>ID</TH>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Phone</TH>
              <TH>&nbsp;</TH>
            </TR>
          </THead>
          <TBody>
            {farmers.map((f) => (
              <TR key={f._id}>
                <TD className="font-mono">{f._id}</TD>
                <TD>{f.name}</TD>
                <TD>{f.email}</TD>
                <TD>{f.phone}</TD>
                <TD>
                  <div className="flex gap-2 justify-end">
                    <button className="px-2 py-1 border rounded" onClick={() => setEditFarmer(f)}>Edit</button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => onDelete(f)}>Delete</button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Farmer">
        <FarmerForm onSubmit={onCreate} submitting={submitting} />
      </Modal>

      <Modal open={!!editFarmer} onClose={() => setEditFarmer(null)} title="Edit Farmer">
        {editFarmer && (
          <FarmerForm
            initial={{
              name: editFarmer.name,
              email: editFarmer.email,
              phone: editFarmer.phone,
              address: editFarmer.address,
              farmName: editFarmer.farmName,
              farmDescription: editFarmer.farmDescription,
              latitude: editFarmer.latitude,
              longitude: editFarmer.longitude,
            }}
            onSubmit={onUpdate}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  )
}
