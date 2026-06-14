import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchMeThunk } from '../store/slices/authSlice'
import { addNotification, fetchUnreadCountThunk, type Notification } from '../store/slices/notificationsSlice'
import { fetchFavoriteIdsThunk } from '../store/slices/favoritesSlice'
import { connectSocket, disconnectSocket } from '../lib/socket'
import toast from 'react-hot-toast'

export function AuthInitializer() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMeThunk())
      dispatch(fetchUnreadCountThunk())
      dispatch(fetchFavoriteIdsThunk())
    }
  }, [dispatch, isAuthenticated])

  // Poll unread count every 30 seconds while authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => {
      dispatch(fetchUnreadCountThunk())
    }, 30000)
    return () => clearInterval(interval)
  }, [dispatch, isAuthenticated])

  // Realtime notifications via WebSocket
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket()
      return
    }
    const socket = connectSocket()
    const handleNewNotification = (notification: Notification) => {
      dispatch(addNotification(notification))
      toast(notification.title, { icon: '🔔' })
    }
    socket.on('newNotification', handleNewNotification)
    return () => {
      socket.off('newNotification', handleNewNotification)
    }
  }, [dispatch, isAuthenticated])

  return null
}
