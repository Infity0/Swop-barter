import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchItemThunk, fetchMyItemsThunk } from '../store/slices/itemsSlice'
import { tradesApi } from '../api/trades.api'
import { CONDITION_LABELS } from '../types/item'
import { MapPin, Eye, ArrowLeftRight, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { FavoriteButton } from '../components/FavoriteButton'

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentItem: item, loading } = useAppSelector((s) => s.items)
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)
  const myItems = useAppSelector((s) => s.items.myItems)
  const [activeImage, setActiveImage] = useState(0)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [proposing, setProposing] = useState(false)

  const fetchedIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (id && fetchedIdRef.current !== id) {
      fetchedIdRef.current = id
      dispatch(fetchItemThunk(id))
    }
  }, [id, dispatch])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl aspect-square animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!item) return <div className="text-center py-20 text-gray-400 dark:text-slate-500">Вещь не найдена</div>

  const isOwner = user?.id === item.ownerId
  const images = item.images ?? []

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden mb-3 relative">
            {images.length > 0 ? (
              <img
                src={images[activeImage]?.url}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-700 text-6xl">📦</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((p) => Math.max(0, p - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 rounded-full p-1 hover:bg-white dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImage((p) => Math.min(images.length - 1, p + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 rounded-full p-1 hover:bg-white dark:hover:bg-slate-800"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-gray-50 dark:bg-slate-900 transition ${
                    i === activeImage ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-2 gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{item.title}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.estimatedValue && (
                <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">~{item.estimatedValue} ₽</span>
              )}
              {!isOwner && <FavoriteButton itemId={item.id} className="!bg-gray-100 dark:!bg-slate-800 !p-2" />}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm px-3 py-1 rounded-full">
              {CONDITION_LABELS[item.condition]}
            </span>
            {item.category && (
              <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm px-3 py-1 rounded-full">
                {item.category.name}
              </span>
            )}
            <span className={`text-sm px-3 py-1 rounded-full ${
              item.status === 'active' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
            }`}>
              {{ active: 'Активно', in_trade: 'В сделке', traded: 'Продано', archived: 'Архив' }[item.status] ?? item.status}
            </span>
          </div>

          {item.city && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 mb-4">
              <MapPin size={14} /> {item.city}
            </div>
          )}

          <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed mb-6">{item.description}</p>

          {item.desiredItems && item.desiredItems.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Ищет в обмен:</h3>
              <div className="flex flex-wrap gap-2">
                {item.desiredItems.map((d, i) => (
                  <span key={i} className="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-500/30">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner */}
          <Link
            to={`/profile/${item.owner?.username}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition mb-6"
          >
            {item.owner?.avatar ? (
              <img src={item.owner.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                <User size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                {item.owner?.firstName} {item.owner?.lastName || item.owner?.username}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                <span className="font-semibold text-gray-700 dark:text-slate-300">{Number(item.owner?.rating || 0).toFixed(1)}</span>
                <span>·</span>
                <span>{item.owner?.successfulTrades} сделок</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 mb-6">
            <Eye size={12} /> {item.viewsCount} просмотров ·{' '}
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ru })}
          </div>

          {/* Actions */}
          {!isOwner && item.status === 'active' && (
            <div>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                  dispatch(fetchMyItemsThunk())
                  setSelectedItemIds([])
                  setShowTradeModal(true)
                }}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  <ArrowLeftRight size={18} />
                  Предложить обмен
                </button>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  Войти для обмена
                </Link>
              )}
            </div>
          )}

          {isOwner && (
            <Link
              to={`/items/${item.id}/edit`}
              className="w-full flex items-center justify-center py-3 rounded-xl border border-gray-200 dark:border-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Редактировать
            </Link>
          )}
        </div>
      </div>

      {/* Trade proposal modal */}
      {showTradeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
          onClick={() => setShowTradeModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Предложить обмен</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Выберите вещи для обмена на <span className="font-medium text-gray-800 dark:text-slate-200">{item.title}</span>.
            </p>

            {myItems.filter((i) => i.status === 'active').length === 0 ? (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                <p className="mb-2">Нет активных вещей для предложения.</p>
                <Link to="/items/new" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
                  Разместить вещь →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto mb-4">
                {myItems
                  .filter((i) => i.status === 'active')
                  .map((myItem) => (
                    <button
                      key={myItem.id}
                      type="button"
                      onClick={() =>
                        setSelectedItemIds((prev) =>
                          prev.includes(myItem.id)
                            ? prev.filter((id) => id !== myItem.id)
                            : [...prev, myItem.id]
                        )
                      }
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                        selectedItemIds.includes(myItem.id)
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                          : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {myItem.images?.[0] ? (
                        <img src={myItem.images[0].url} className="w-12 h-12 rounded-lg object-contain bg-gray-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{myItem.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{myItem.estimatedValue ? `~${myItem.estimatedValue} ₽` : 'Цена не указана'}</p>
                      </div>
                      {selectedItemIds.includes(myItem.id) && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowTradeModal(false)}
                className="flex-1 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={selectedItemIds.length === 0 || proposing}
                onClick={async () => {
                  if (!item.owner?.id || selectedItemIds.length === 0) return
                  setProposing(true)
                  try {
                    await tradesApi.create({
                      receiverId: item.owner.id,
                      initiatorItemIds: selectedItemIds,
                      receiverItemIds: [item.id],
                    })
                    toast.success('Предложение отправлено!')
                    setShowTradeModal(false)
                    navigate('/trades')
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Не удалось отправить предложение')
                  } finally {
                    setProposing(false)
                  }
                }}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {proposing ? 'Отправка...' : `Отправить (${selectedItemIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
