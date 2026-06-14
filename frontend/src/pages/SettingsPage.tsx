import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { usersApi } from '../api/users.api'
import { setUser } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { User } from 'lucide-react'

const schema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
})
type FormData = z.infer<typeof schema>

export function SettingsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const [avatarLoading, setAvatarLoading] = useState(false)

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      city: user?.city || '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await usersApi.update(data)
      dispatch(setUser(res.data))
      toast.success('Профиль обновлён!')
    } catch {
      toast.error('Не удалось сохранить')
    }
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      const res = await usersApi.uploadAvatar(file)
      dispatch(setUser(res.data))
      toast.success('Фото обновлено!')
    } catch {
      toast.error('Не удалось загрузить фото')
    } finally {
      setAvatarLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Настройки</h1>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">Аватар</h2>
        <div className="flex items-center gap-5">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
              <User size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatar}
              disabled={avatarLoading}
            />
            <span className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
              {avatarLoading ? 'Загрузка...' : 'Изменить фото'}
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">О себе</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Имя</label>
              <input {...register('firstName')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Фамилия</label>
              <input {...register('lastName')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Город</label>
            <input {...register('city')} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">О себе</label>
            <textarea {...register('bio')} rows={3} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Расскажите о себе..." />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  )
}
