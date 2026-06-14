import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchMyItemsThunk } from '../store/slices/itemsSlice'
import { itemsApi } from '../api/items.api'
import { CONDITION_LABELS } from '../types/item'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function MyItemsPage() {
  const dispatch = useAppDispatch()
  const { myItems } = useAppSelector((s) => s.items)

  useEffect(() => {
    dispatch(fetchMyItemsThunk())
  }, [dispatch])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту вещь?')) return
    try {
      await itemsApi.delete(id)
      toast.success('Вещь удалена')
      dispatch(fetchMyItemsThunk())
    } catch {
      toast.error('Не удалось удалить')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Мои вещи</h1>
        <Link
          to="/items/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} /> Разместить
        </Link>
      </div>

      {myItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <p className="text-lg font-medium mb-2">Пока нет вещей</p>
          <Link to="/items/new" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
            Разместите первую вещь
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {myItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <Link to={`/items/${item.id}`} className="block aspect-video bg-gray-50 dark:bg-slate-900 overflow-hidden border-b border-gray-100 dark:border-slate-700">
                {item.images?.[0] ? (
                  <img src={item.images[0].url} alt={item.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-700 text-4xl">📦</div>
                )}
              </Link>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm truncate">{item.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    {CONDITION_LABELS[item.condition]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.status === 'active' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 dark:border-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <Pencil size={12} /> Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-xs hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={12} /> Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
