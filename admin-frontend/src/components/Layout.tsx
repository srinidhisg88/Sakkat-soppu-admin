import logoUrl from '@/assets/logo'
import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function Layout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen flex">
      {/* Mobile header */}
      <div className="md:hidden fixed inset-x-0 top-0 z-40 bg-white border-b h-12 flex items-center px-4">
        <button aria-label="Open menu" className="mr-3" onClick={() => setOpen(true)}>☰</button>
  <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded mr-2 object-contain" />
        <div className="font-semibold">Sakkat Soppu Admin</div>
      </div>
      {/* Sidebar */}
      <div className={`fixed md:static z-50 inset-y-0 left-0 transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform md:w-64 w-64`}>
        <div className="md:hidden absolute right-2 top-2">
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-gray-600">✕</button>
        </div>
        <Sidebar />
      </div>
      <main className="flex-1 p-4 md:p-6 md:ml-0 ml-0 w-full md:pt-6 pt-14">
        <Outlet />
      </main>
    </div>
  )
}
