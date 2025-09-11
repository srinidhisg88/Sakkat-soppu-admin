import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loader from '@/components/ui/Loader'
import { getAnalytics, Analytics } from '@/api/analyticsApi'
import { getProducts } from '@/api/productsApi'

export default function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [lowStock, setLowStock] = useState<{ name: string; stock: number }[]>([])
  const LOW_STOCK_THRESHOLD = 10

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await getAnalytics()
        setData(res)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await getProducts()
        const items = (res.data || []).filter((p: any) => typeof p.stock === 'number' && p.stock <= LOW_STOCK_THRESHOLD)
        setLowStock(items.slice(0, 5).map((p: any) => ({ name: p.name, stock: p.stock })))
      } catch {}
    })()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Sakkat Soppu</h1>
      <p className="text-gray-600 mb-6">Admin Dashboard</p>

      {loading ? (
        <div className="p-8 flex justify-center"><Loader /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPI title="Total Users" value={data?.totalUsers ?? 0} />
          <KPI title="Total Orders" value={data?.totalOrders ?? 0} />
          <KPI title="Total Products" value={data?.totalProducts ?? 0} />
          <KPI title="Total Sales" value={`₹${Number(data?.totalSales ?? 0).toFixed(2)}`} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded">
          <div className="text-sm text-gray-500">Quick Links</div>
          <ul className="list-disc list-inside text-sm mt-2 text-green-700">
            <li>Manage Orders</li>
            <li>Manage Products</li>
            <li>Manage Farmers</li>
          </ul>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded">
          <div className="text-sm text-amber-800 font-semibold">Low stock (≤ {LOW_STOCK_THRESHOLD})</div>
          {lowStock.length === 0 ? (
            <div className="text-amber-800 text-sm mt-1">No products are low on stock.</div>
          ) : (
            <ul className="mt-2 text-amber-900 text-sm list-disc list-inside">
              {lowStock.map((p, i) => (
                <li key={i}>{p.name} — {p.stock}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function KPI({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-4 bg-white border rounded">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  )
}
