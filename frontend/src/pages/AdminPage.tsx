import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, type AdminStats, type AdminDetailedStats, type AdminReview, type CreateCategoryDto } from '../api/admin.api'
import type { User } from '../types/user'
import { getUserDisplayName } from '../types/user'
import type { Item } from '../types/item'
import { CONDITION_LABELS } from '../types/item'
import type { Category } from '../types/category'
import { Users, Package, Repeat, Star, ShieldCheck, ShieldOff, Trash2, Search, Plus, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const TRADE_STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидание',
  accepted: 'Принято',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
  completed: 'Завершено',
}

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7']

type Tab = 'stats' | 'users' | 'items' | 'categories' | 'reviews'

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('stats')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [detailedStats, setDetailedStats] = useState<AdminDetailedStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')

  const loadStats = async () => {
    const { data } = await adminApi.getStats()
    setStats(data)
  }

  const loadDetailedStats = async () => {
    const { data } = await adminApi.getDetailedStats()
    setDetailedStats(data)
  }

  const loadUsers = async (search?: string) => {
    const { data } = await adminApi.getUsers(search)
    setUsers(data)
  }

  const loadItems = async (search?: string) => {
    const { data } = await adminApi.getItems(search)
    setItems(data)
  }

  const loadCategories = async () => {
    const { data } = await adminApi.getCategories()
    setCategories(data)
  }

  const loadReviews = async () => {
    const { data } = await adminApi.getReviews()
    setReviews(data)
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([loadStats(), loadDetailedStats(), loadUsers(), loadItems(), loadCategories(), loadReviews()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadUsers(userSearch), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch])

  useEffect(() => {
    const t = setTimeout(() => loadItems(itemSearch), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemSearch])

  const handleToggleBlock = async (user: User) => {
    try {
      await adminApi.toggleUserBlock(user.id)
      toast.success(user.isActive ? 'Пользователь заблокирован' : 'Пользователь разблокирован')
      loadUsers(userSearch)
    } catch {
      toast.error('Не удалось изменить статус пользователя')
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Удалить эту вещь?')) return
    try {
      await adminApi.deleteItem(id)
      toast.success('Вещь удалена')
      loadItems(itemSearch)
      loadStats()
    } catch {
      toast.error('Не удалось удалить вещь')
    }
  }

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Удалить этот отзыв?')) return
    try {
      await adminApi.deleteReview(id)
      toast.success('Отзыв удалён')
      loadReviews()
      loadStats()
    } catch {
      toast.error('Не удалось удалить отзыв')
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stats', label: 'Статистика' },
    { key: 'users', label: 'Пользователи' },
    { key: 'items', label: 'Товары' },
    { key: 'categories', label: 'Категории' },
    { key: 'reviews', label: 'Отзывы' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Админ-панель</h1>

      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">Загрузка...</div>
      ) : (
        <>
          {tab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={<Users size={20} />} label="Пользователи" value={stats.usersCount} />
                <StatCard icon={<Package size={20} />} label="Товары" value={stats.itemsCount} />
                <StatCard icon={<Repeat size={20} />} label="Сделки" value={stats.tradesCount} />
                <StatCard icon={<Star size={20} />} label="Отзывы" value={stats.reviewsCount} />
              </div>

              {detailedStats && (
                <div className="grid sm:grid-cols-2 gap-6">
                  <ChartCard title="Товары по категориям">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={detailedStats.itemsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-slate-700" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Товары" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Сделки по статусам">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={detailedStats.tradesByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={(props: any) => `${TRADE_STATUS_LABELS[props.status] ?? props.status}: ${props.count}`}
                        >
                          {detailedStats.tradesByStatus.map((entry, i) => (
                            <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, _name, item) => [value, TRADE_STATUS_LABELS[item.payload.status] ?? item.payload.status]} />
                      </PieChart>
                    </ResponsiveContainer>
                    {detailedStats.tradesByStatus.length === 0 && (
                      <div className="text-center text-sm text-gray-400 dark:text-slate-500 -mt-32">Сделок пока нет</div>
                    )}
                  </ChartCard>

                  <ChartCard title="Товары по состоянию">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={detailedStats.itemsByCondition}
                          dataKey="count"
                          nameKey="condition"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={(props: any) => `${CONDITION_LABELS[props.condition as keyof typeof CONDITION_LABELS] ?? props.condition}: ${props.count}`}
                        >
                          {detailedStats.itemsByCondition.map((entry, i) => (
                            <Cell key={entry.condition} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, _name, item) => [value, CONDITION_LABELS[item.payload.condition as keyof typeof CONDITION_LABELS] ?? item.payload.condition]} />
                      </PieChart>
                    </ResponsiveContainer>
                    {detailedStats.itemsByCondition.length === 0 && (
                      <div className="text-center text-sm text-gray-400 dark:text-slate-500 -mt-32">Нет данных</div>
                    )}
                  </ChartCard>

                  <ChartCard title="Регистрации и товары по дням">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-slate-700" />
                        <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line data={detailedStats.usersOverTime} dataKey="count" name="Пользователи" stroke="#6366f1" strokeWidth={2} dot={false} />
                        <Line data={detailedStats.itemsOverTime} dataKey="count" name="Товары" stroke="#22c55e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div>
              <div className="relative mb-4 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Поиск по имени или email..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700 text-left text-gray-500 dark:text-slate-400">
                      <th className="px-4 py-3 font-medium">Пользователь</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Роль</th>
                      <th className="px-4 py-3 font-medium">Статус</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                        <td className="px-4 py-3">
                          <Link to={`/profile/${u.username}`} className="font-medium text-gray-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                            {getUserDisplayName(u)}
                          </Link>
                          <div className="text-xs text-gray-400 dark:text-slate-500">@{u.username}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            u.role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                          }`}>
                            {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            u.isActive ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                          }`}>
                            {u.isActive ? 'Активен' : 'Заблокирован'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleBlock(u)}
                              className={`flex items-center gap-1 ml-auto text-xs px-2 py-1 rounded-lg border ${
                                u.isActive
                                  ? 'border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                  : 'border-green-100 dark:border-green-500/30 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10'
                              }`}
                            >
                              {u.isActive ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                              {u.isActive ? 'Заблокировать' : 'Разблокировать'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Ничего не найдено</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'items' && (
            <div>
              <div className="relative mb-4 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Поиск по названию..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700 text-left text-gray-500 dark:text-slate-400">
                      <th className="px-4 py-3 font-medium">Товар</th>
                      <th className="px-4 py-3 font-medium">Владелец</th>
                      <th className="px-4 py-3 font-medium">Состояние</th>
                      <th className="px-4 py-3 font-medium">Статус</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                        <td className="px-4 py-3">
                          <Link to={`/items/${item.id}`} className="font-medium text-gray-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400">
                            {item.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-slate-300">@{item.owner?.username}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                            {CONDITION_LABELS[item.condition]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.status === 'active' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex items-center gap-1 ml-auto text-xs px-2 py-1 rounded-lg border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <Trash2 size={12} /> Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Ничего не найдено</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'categories' && (
            <CategoriesTab categories={categories} reload={loadCategories} />
          )}

          {tab === 'reviews' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700 text-left text-gray-500 dark:text-slate-400">
                    <th className="px-4 py-3 font-medium">От кого</th>
                    <th className="px-4 py-3 font-medium">Кому</th>
                    <th className="px-4 py-3 font-medium">Оценка</th>
                    <th className="px-4 py-3 font-medium">Комментарий</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                      <td className="px-4 py-3 text-gray-900 dark:text-slate-100 font-medium">@{r.reviewer?.username}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300">@{r.reviewee?.username}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Star size={12} fill="currentColor" /> {r.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-slate-300 max-w-sm truncate">{r.comment || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="flex items-center gap-1 ml-auto text-xs px-2 py-1 rounded-lg border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={12} /> Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Отзывов нет</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">{title}</h3>
      {children}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</div>
        <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  )
}

const emptyForm: CreateCategoryDto = { name: '', description: '', icon: '', slug: '' }

function CategoriesTab({ categories, reload }: { categories: Category[]; reload: () => Promise<void> }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateCategoryDto>(emptyForm)

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', slug: cat.slug || '' })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Введите название категории')
      return
    }
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, form)
        toast.success('Категория обновлена')
      } else {
        await adminApi.createCategory(form)
        toast.success('Категория создана')
      }
      closeForm()
      reload()
    } catch {
      toast.error('Не удалось сохранить категорию')
    }
  }

  const handleToggleActive = async (cat: Category) => {
    try {
      await adminApi.updateCategory(cat.id, { isActive: !cat.isActive })
      reload()
    } catch {
      toast.error('Не удалось изменить статус категории')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту категорию?')) return
    try {
      await adminApi.deleteCategory(id)
      toast.success('Категория удалена')
      reload()
    } catch {
      toast.error('Не удалось удалить категорию (возможно, в ней есть товары)')
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={startCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 dark:shadow-none"
        >
          <Plus size={16} /> Добавить категорию
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">{editingId ? 'Редактировать категорию' : 'Новая категория'}</h3>
            <button onClick={closeForm} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
              <X size={18} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Название"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Слаг (например, electronics)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Иконка (например, laptop)"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Описание"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={closeForm} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700">
              Отмена
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              Сохранить
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700 text-left text-gray-500 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Слаг</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{cat.slug || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      cat.isActive ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    {cat.isActive ? 'Активна' : 'Скрыта'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <Pencil size={12} /> Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={12} /> Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Категорий нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
