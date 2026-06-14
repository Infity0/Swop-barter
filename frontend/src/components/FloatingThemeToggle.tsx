import { Sun, Moon } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const PAGES_WITHOUT_NAVBAR = ['/login', '/register']

export function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  if (!PAGES_WITHOUT_NAVBAR.includes(location.pathname)) return null

  return (
    <button
      onClick={toggleTheme}
      aria-label="Переключить тему"
      className="fixed top-4 right-4 z-[100] p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm transition-all"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
