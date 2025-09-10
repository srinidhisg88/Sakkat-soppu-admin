export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Sakkat Soppu</h1>
      <p className="text-gray-600 mb-6">Admin Dashboard</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded">
          <div className="text-sm text-gray-500">Quick Links</div>
          <ul className="list-disc list-inside text-sm mt-2 text-green-700">
            <li>Manage Orders</li>
            <li>Manage Products</li>
            <li>Manage Farmers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
