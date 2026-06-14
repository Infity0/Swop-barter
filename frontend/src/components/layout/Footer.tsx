import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Swop</span>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">Платформа бартерного<br />обмена вещами.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-4 text-sm">Платформа</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/browse" className="hover:text-slate-200 transition-colors">Каталог вещей</Link></li>
              <li><Link to="/items/new" className="hover:text-slate-200 transition-colors">Разместить вещь</Link></li>
              <li><Link to="/trades" className="hover:text-slate-200 transition-colors">Мои сделки</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-4 text-sm">Аккаунт</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/login" className="hover:text-slate-200 transition-colors">Войти</Link></li>
              <li><Link to="/register" className="hover:text-slate-200 transition-colors">Регистрация</Link></li>
              <li><Link to="/settings" className="hover:text-slate-200 transition-colors">Настройки</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-4 text-sm">Информация</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="/#how" onClick={(e) => { e.preventDefault(); window.location.href = '/#how'; const el = document.getElementById('how'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-slate-200 transition-colors cursor-pointer">Как это работает</a></li>
              <li><Link to="/browse" className="hover:text-slate-200 transition-colors">Безопасные сделки</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-600">© {new Date().getFullYear()} Swop</span>
          <span className="text-xs text-slate-700">Сделано с ❤️</span>
        </div>
      </div>
    </footer>
  )
}
