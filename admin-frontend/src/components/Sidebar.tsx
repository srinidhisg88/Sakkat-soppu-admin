import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import logoUrl from '@/assets/logo'

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200 font-medium' : ''}`

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const doLogout = async () => {
    await logout()
    navigate('/login')
  }
  return (
    <aside className="w-64 bg-white border-r h-full md:h-screen md:sticky md:top-0 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded object-contain" />
        <div className="text-xl font-bold">Sakkat Soppu Admin</div>
      </div>
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={linkClasses}>Dashboard</NavLink>
        <NavLink to="/orders" className={linkClasses}>Orders</NavLink>
        <NavLink to="/products" className={linkClasses}>Products</NavLink>
        <NavLink to="/farmers" className={linkClasses}>Farmers</NavLink>
  <NavLink to="/coupons" className={linkClasses}>Coupons</NavLink>
  <NavLink to="/audit-logs" className={linkClasses}>Audit Logs</NavLink>
      </nav>
      <button onClick={doLogout} className="mt-8 w-full px-4 py-2 border rounded hover:bg-gray-100">Logout</button>
    </aside>
  )
}
