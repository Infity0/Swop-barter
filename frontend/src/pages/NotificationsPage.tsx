import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchNotificationsThunk } from '../store/slices/notificationsSlice'
import { fetchUnreadCountThunk } from '../store/slices/notificationsSlice'
import { notificationsApi } from '../api/notifications.api'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function NotificationsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { notifications } = useAppSelector((s) => s.notifications)

  useEffect(() => {
    dispatch(fetchNotificationsThunk())
  }, [dispatch])

  const markAll = async () => {
    await notificationsApi.markAllAsRead()
    dispatch(fetchNotificationsThunk())
    dispatch(fetchUnreadCountThunk())
    toast.success('Все прочитано')
  }

  const handleClick = async (n: { id: string; isRead: boolean; referenceId?: string }) => {
    if (!n.isRead) {
      await notificationsApi.markAsRead(n.id)
      dispatch(fetchNotificationsThunk())
      dispatch(fetchUnreadCountThunk())
    }
    if (n.referenceId) {
      navigate(`/trades/${n.referenceId}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Уведомления</h1>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAll}
            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <CheckCheck size={16} /> Отметить все
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <Bell size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Уведомлений нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-sm ${
                n.isRead ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600' : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/30 hover:border-indigo-200 dark:hover:border-indigo-500/50'
              } ${n.referenceId ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{n.title}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300 mt-0.5">{n.body}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />}
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ru })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
