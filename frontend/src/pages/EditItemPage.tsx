import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { itemsApi } from '../api/items.api'
import type { Category } from '../types/category'
import type { Item } from '../types/item'
import { CONDITION_LABELS } from '../types/item'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  title: z.string().min(3, 'Название должно содержать не менее 3 символов').max(100, 'Название не должно превышать 100 символов'),
  description: z.string().min(10, 'Описание должно содержать не менее 10 символов').max(2000, 'Описание не должно превышать 2000 символов'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  estimatedValue: z.coerce.number().optional(),
  city: z.string().max(100).optional(),
  categoryId: z.string().optional(),
  desiredItemsStr: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function EditItemPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [item, setItem] = useState<Item | null>(null)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      itemsApi.getOne(id!).then((r) => r.data),
    ])
      .then(([cats, fetchedItem]) => {
        setCategories(cats)
        setItem(fetchedItem)
        reset({
          title: fetchedItem.title,
          description: fetchedItem.description,
          condition: fetchedItem.condition,
          estimatedValue: fetchedItem.estimatedValue ?? undefined,
          city: fetchedItem.city ?? undefined,
          categoryId: fetchedItem.category?.id ?? '',
          desiredItemsStr: fetchedItem.desiredItems?.join(', ') ?? '',
        })
      })
      .catch(() => toast.error('Failed to load item'))
      .finally(() => setFetching(false))
  }, [id, reset])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, 10)
    setNewFiles(selected)
    setNewPreviews(selected.map((f) => URL.createObjectURL(f)))
  }

  const onSubmit = async (data: FormData) => {
    if (!id) return
    setLoading(true)
    try {
      const desiredItems = data.desiredItemsStr
        ? data.desiredItemsStr.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      await itemsApi.update(id, {
        title: data.title,
        description: data.description,
        condition: data.condition,
        estimatedValue: data.estimatedValue,
        city: data.city,
        categoryId: data.categoryId,
        desiredItems,
      })
      if (newFiles.length > 0) {
        await itemsApi.uploadImages(id, newFiles)
      }
      toast.success('Вещь обновлена!')
      navigate(`/items/${id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Не удалось обновить вещь')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!item) {
    return <div className="text-center py-20 text-gray-500 dark:text-slate-400">Вещь не найдена.</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Редактировать вещь</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Название *</label>
          <input {...register('title')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Описание *</label>
          <textarea {...register('description')} rows={4} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Состояние *</label>
            <select {...register('condition')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm">
              {(Object.entries(CONDITION_LABELS) as [string, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Категория</label>
            <select {...register('categoryId')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm">
              <option value="">Без категории</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Оценочная стоимость (₽)</label>
            <input {...register('estimatedValue')} type="number" min="0" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Необязательно" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Город</label>
            <input {...register('city')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Хочу получить в обмен</label>
          <input {...register('desiredItemsStr')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="напр., Ноутбук, Книги" />
        </div>

        {item.images && item.images.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Текущие фото</label>
            <div className="flex gap-2 flex-wrap">
              {item.images.map((img) => (
                <img key={img.id} src={img.url} alt="" className="w-20 h-20 object-contain rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900" />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            {item.images && item.images.length > 0 ? 'Заменить фото (необязательно)' : 'Добавить фото (до 10)'}
          </label>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFiles} className="block w-full text-sm text-gray-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20" />
          {newPreviews.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {newPreviews.map((src, i) => (
                <img key={i} src={src} alt="" className="w-20 h-20 object-contain rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900" />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/items/${id}`)}
            className="flex-1 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  )
}
// EditItemPage is similar but pre-fills the form with existing item data
// Full implementation would fetch item and pre-populate form fields
