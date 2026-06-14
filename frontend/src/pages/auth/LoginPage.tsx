import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginThunk, clearError } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

const schema = z.object({
  login: z.string().min(1, 'Обязательное поле'),
  password: z.string().min(1, 'Обязательное поле'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (isAuthenticated) navigate('/browse')
  }, [isAuthenticated, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(loginThunk(data))
    if (loginThunk.fulfilled.match(result)) {
      toast.success('Добро пожаловать обратно!')
      navigate('/browse')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 0%, transparent 50%), radial-gradient(circle at 70% 80%, white 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <Link to="/" className="text-5xl font-black text-white tracking-tight hover:opacity-80 transition-opacity">Swop</Link>
          <p className="text-indigo-200 text-lg mt-3">Бартер нового поколения</p>
          <div className="mt-10 flex flex-col gap-3 text-left">
            {['Бесплатно навсегда', 'Никаких комиссий', 'Живой чат', 'Прямые P2P сделки'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-indigo-100">
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="lg:hidden inline-block text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-6">Swop</Link>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Добро пожаловать</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Войдите в свой аккаунт</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Емайл или логин</label>
              <input
                {...register('login')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                placeholder="you@example.com"
                autoComplete="username"
              />
              {errors.login && <p className="text-red-500 text-xs mt-1.5">{errors.login.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Пароль</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300" onClick={() => dispatch(clearError())}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
