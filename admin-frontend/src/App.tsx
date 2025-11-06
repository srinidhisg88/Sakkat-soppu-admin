import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import AdminSignup from '@/pages/AdminSignup'
import Dashboard from '@/pages/Dashboard'
import Orders from '@/pages/Orders'
import Products from '@/pages/Products'
import Farmers from '@/pages/Farmers'
import FarmerDetail from '@/pages/FarmerDetail'
import Coupons from '@/pages/Coupons'
import AuditLogs from '@/pages/AuditLogs'
import Layout from '@/components/Layout'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Categories from '@/pages/Categories'
import DeliverySettingsPage from '@/pages/DeliverySettings'
import HomepageVideos from '@/pages/HomepageVideos'

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/farmers/:id" element={<FarmerDetail />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/delivery-settings" element={<DeliverySettingsPage />} />
          <Route path="/homepage-videos" element={<HomepageVideos />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
