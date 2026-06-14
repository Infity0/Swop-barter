import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchItemsThunk } from '../store/slices/itemsSlice'
import type { Category } from '../types/category'
import type { ItemCondition } from '../types/item'
import { CONDITION_LABELS } from '../types/item'
import { Search, SlidersHorizontal, MapPin, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FavoriteButton } from '../components/FavoriteButton'

export function BrowsePage() {
  const dispatch = useAppDispatch()
  const { items, loading, totalPages } = useAppSelector((s) => s.items)
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const condition = (searchParams.get('condition') || '') as ItemCondition | ''
  const city = searchParams.get('city') || ''
  const sort = searchParams.get('sort') || 'createdAt:DESC'
  const currentPage = Number(searchParams.get('page') || 1)
  const [sortBy, sortOrder] = sort.split(':') as [string, 'ASC' | 'DESC']

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    dispatch(fetchItemsThunk({
      search,
      categoryId,
      condition: condition || undefined,
      city: city || undefined,
      sortBy,
      sortOrder,
      page: currentPage,
    }))
  }, [dispatch, search, categoryId, condition, city, sortBy, sortOrder, currentPage])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Каталог вещей</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Найди вещи для обмена</p>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Поиск вещей..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold border transition-all shadow-sm ${
            showFilters
              ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <SlidersHorizontal size={15} />
          Фильтры
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 mb-5 grid sm:grid-cols-3 gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Категория</label>
            <select
              value={categoryId}
              onChange={(e) => updateParam('categoryId', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Все категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Состояние</label>
            <select
              value={condition}
              onChange={(e) => updateParam('condition', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Любое состояние</option>
              {(Object.entries(CONDITION_LABELS) as [ItemCondition, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Город</label>
            <input
              value={city}
              onChange={(e) => updateParam('city', e.target.value)}
              placeholder="Например, Москва"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Сортировка</label>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt:DESC">Сначала новые</option>
              <option value="createdAt:ASC">Сначала старые</option>
              <option value="estimatedValue:DESC">Сначала дороже</option>
              <option value="estimatedValue:ASC">Сначала дешевле</option>
              <option value="viewsCount:DESC">По популярности</option>
            </select>
          </div>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
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
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">Вещи не найдены</p>
          <p className="text-sm mt-1">Измените запрос или фильтры</p>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                p === currentPage
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
