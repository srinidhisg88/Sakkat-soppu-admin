import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getFarmer, Farmer } from '@/api/farmersApi'
import MediaSlider from '@/components/ui/MediaSlider'

export default function FarmerDetail() {
  const { id } = useParams()
  const [farmer, setFarmer] = useState<Farmer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const data = await getFarmer(id)
        if (active) setFarmer(data)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load farmer')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id])

  if (loading) {
    return <div className="p-4">Loading…</div>
  }
  if (!farmer) {
    return (
      <div className="p-4">
        <div className="mb-3"><Link to="/farmers" className="text-green-700 hover:underline">← Back to farmers</Link></div>
        <div className="border rounded p-4 bg-white">Not found</div>
      </div>
    )
  }

  const media = [
    ...((farmer.images || []).map((src) => ({ type: 'image' as const, src }))),
    ...((farmer.videos || []).map((src) => ({ type: 'video' as const, src }))),
  ]

  return (
    <div className="p-4">
      <div className="mb-3"><Link to="/farmers" className="text-green-700 hover:underline">← Back to farmers</Link></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded p-4">
            <h2 className="text-xl font-semibold mb-3">Media</h2>
            <MediaSlider items={media} />
          </div>
        </div>
        <div>
          <div className="bg-white border rounded p-4 space-y-2">
            <h2 className="text-xl font-semibold">{farmer.name}</h2>
            {farmer.farmName && <div className="text-gray-700">{farmer.farmName}</div>}
            {farmer.farmDescription && <div className="text-gray-500 text-sm">{farmer.farmDescription}</div>}
            <div className="pt-2 space-y-1 text-sm">
              {farmer.phone && <div><span className="font-medium">Phone:</span> {farmer.phone}</div>}
              {farmer.address && <div><span className="font-medium">Address:</span> {farmer.address}</div>}
              <div className="text-xs text-gray-400 pt-2">ID: <span className="font-mono">{farmer._id}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
