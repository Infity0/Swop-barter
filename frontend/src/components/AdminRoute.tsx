import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export function AdminRoute() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/browse" replace />
  return <Outlet />
}
