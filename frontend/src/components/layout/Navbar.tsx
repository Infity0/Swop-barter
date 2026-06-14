import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, Package, ArrowLeftRight, User, LogOut, Plus, Search, Settings, ShieldCheck, Sun, Moon, Heart, Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logoutThunk } from '../../store/slices/authSlice'
import { useTheme } from '../../hooks/useTheme'
import toast from 'react-hot-toast'

export function Navbar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount)
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [menuOpen])

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)

  const iconLinkClass = (path: string) =>
    `p-2.5 rounded-xl transition-all relative ${
      isActive(path)
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`

  const menuLinkClass = (path: string) =>
    `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all ${
      isActive(path)
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-medium'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
    }`

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    toast.success('Вышли из аккаунта')
    navigate('/')
  }

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/browse' : '/'} className="flex items-center gap-2 shrink-0 group">
            <span className="text-xl font-extrabold logo-gradient tracking-tight inline-block transition-transform duration-200 group-hover:scale-110 group-active:scale-95 group-hover:animate-[splash-gradient-sweep_1s_ease-in-out]">
              Swop
            </span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Поиск вещей..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value
                    navigate(`/browse?search=${encodeURIComponent(q)}`)
                  }
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/items/new"
                  className="hidden md:flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200/60 dark:shadow-none mr-1"
                >
                  <Plus size={15} />
                  Разместить
                </Link>

                <Link to="/trades" className={iconLinkClass('/trades')}>
                  <ArrowLeftRight size={18} />
                </Link>

                <Link to="/notifications" className={iconLinkClass('/notifications')}>
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative ml-1" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((open) => !open)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    aria-label="Меню профиля"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                        <User size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                  <div
                    className={`absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 py-2 transition-all ${
                      menuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'
                    }`}
                  >
                    <div className="px-4 py-2.5 mb-1 border-b border-slate-50 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.firstName || user?.username}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">@{user?.username}</p>
                    </div>
                    <Link to="/my-items" className={menuLinkClass('/my-items')}>
                      <Package size={15} /> Мои вещи
                    </Link>
                    <Link to="/favorites" className={menuLinkClass('/favorites')}>
                      <Heart size={15} /> Избранное
                    </Link>
                    <Link to="/matches" className={menuLinkClass('/matches')}>
                      <Sparkles size={15} /> Подбор обменов
                    </Link>
                    {user && (
                      <Link to={`/profile/${user.username}`} className={menuLinkClass(`/profile/${user.username}`)}>
                        <User size={15} /> Профиль
                      </Link>
                    )}
                    <Link to="/settings" className={menuLinkClass('/settings')}>
                      <Settings size={15} /> Настройки
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className={menuLinkClass('/admin')}>
                        <ShieldCheck size={15} /> Админ-панель
                      </Link>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <LogOut size={15} /> Выйти
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  Войти
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200/60 dark:shadow-none">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
