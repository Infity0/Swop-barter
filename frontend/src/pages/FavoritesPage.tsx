import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchFavoritesThunk } from '../store/slices/favoritesSlice'
import { CONDITION_LABELS } from '../types/item'
import { Heart, MapPin, Eye } from 'lucide-react'
import { FavoriteButton } from '../components/FavoriteButton'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export function FavoritesPage() {
  const dispatch = useAppDispatch()
  const { items, loading } = useAppSelector((s) => s.favorites)

  useEffect(() => {
    dispatch(fetchFavoritesThunk())
  }, [dispatch])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Избранное</h1>

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-slate-100 dark:bg-slate-700 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-slate-400 dark:text-slate-500">
          <Heart size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">В избранном пока пусто</p>
          <Link to="/browse" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mt-2 inline-block">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/30 shadow-sm transition-all duration-300 group hover:-translate-y-1 border border-slate-100/80 dark:border-slate-700"
            >
              <div className="aspect-square bg-slate-50 dark:bg-slate-900 overflow-hidden relative border-b border-slate-100 dark:border-slate-700">
                {item.images?.[0] ? (
                  <img
                    src={item.images.find((i) => i.isPrimary)?.url || item.images[0].url}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-slate-200 dark:text-slate-700">📦</div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-700 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {CONDITION_LABELS[item.condition]}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                  <FavoriteButton itemId={item.id} />
                  {item.estimatedValue && (
                    <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      ~{item.estimatedValue} ₽
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate mb-1.5">{item.title}</h3>
                {item.city && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-2">
                    <MapPin size={11} /> {item.city}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ru })}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Eye size={11} /> {item.viewsCount}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
