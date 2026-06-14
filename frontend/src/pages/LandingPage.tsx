import { Link } from 'react-router-dom'
import { ArrowRight, Repeat2, ShieldCheck, Package, CheckCircle, Zap, Users, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <div className="min-h-screen" style={{ background: dark ? '#0f172a' : '#f8f9ff', transition: 'background 0.2s ease' }}>
      {/* Navbar */}
      <nav style={{ background: dark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${dark ? '#1e293b' : '#e8e8f0'}`, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
            Swop
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme} aria-label="Переключить тему" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 10, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, background: dark ? '#1e293b' : '#f8fafc', color: dark ? '#cbd5e1' : '#475569', cursor: 'pointer' }}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#475569', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = dark ? '#1e293b' : '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              Войти
            </Link>
            <Link to="/register" style={{ fontSize: 14, fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', padding: '9px 20px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
              Начать →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 100, background: dark ? 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f0f0ff 50%, #f8f9ff 100%)', position: 'relative' }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: -80, left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: '5%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(124,58,237,0.15)' : '#ede9fe', border: `1px solid ${dark ? 'rgba(167,139,250,0.3)' : '#c4b5fd'}`, color: dark ? '#c4b5fd' : '#6d28d9', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 100, marginBottom: 32 }}>
            ✦ Платформа бартерного обмена
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 900, color: dark ? '#f1f5f9' : '#0f172a', marginBottom: 24, lineHeight: 1.05, letterSpacing: '-2px' }}>
            Меняй вещи.<br />
            <span style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Бесплатно.
            </span>
          </h1>
          <p style={{ fontSize: 20, color: dark ? '#94a3b8' : '#64748b', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Swop — платформа для прямого обмена вещами между людьми.<br />Никаких денег, только честный бартер.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', padding: '16px 32px', borderRadius: 16, fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 30px rgba(79,70,229,0.4)' }}>
              Начать обмен <ArrowRight size={18} />
            </Link>
            <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? '#1e293b' : '#0f172a', border: `1px solid ${dark ? '#334155' : 'transparent'}`, color: '#fff', padding: '16px 32px', borderRadius: 16, fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>
              Смотреть вещи
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 40, flexWrap: 'wrap' }}>
            {['Бесплатно навсегда', 'Без привязки карты', 'Реальные люди'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: dark ? '#94a3b8' : '#94a3b8' }}>
                <CheckCircle size={15} color="#10b981" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '96px 32px', background: dark ? '#0f172a' : '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: dark ? '#a78bfa' : '#6d28d9', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Как это работает</p>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: dark ? '#f1f5f9' : '#0f172a', letterSpacing: '-1px' }}>Три шага до обмена</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { icon: <Package size={24} />, num: 'Шаг 1', title: 'Размести вещь', desc: 'Сфотографируй вещь, добавь описание и состояние. Займёт не больше двух минут.', bg: '#eef2ff', border: '#dbe3ff', darkBg: 'rgba(99,102,241,0.08)', darkBorder: 'rgba(99,102,241,0.25)', iconBg: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
              { icon: <Repeat2 size={24} />, num: 'Шаг 2', title: 'Найди обмен', desc: 'Просматривай каталог и предлагай свои вещи в обмен на те, что нравятся.', bg: '#f5f3ff', border: '#e6e0ff', darkBg: 'rgba(124,58,237,0.08)', darkBorder: 'rgba(124,58,237,0.25)', iconBg: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
              { icon: <ShieldCheck size={24} />, num: 'Шаг 3', title: 'Завершите сделку', desc: 'Переписывайтесь в чате, договаривайтесь об условиях и обменивайтесь напрямую.', bg: '#faf5ff', border: '#f0e0ff', darkBg: 'rgba(168,85,247,0.08)', darkBorder: 'rgba(168,85,247,0.25)', iconBg: 'linear-gradient(135deg, #9333ea, #a855f7)' },
            ].map((f, i) => {
              const defaultShadow = dark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(79,70,229,0.05)'
              const hoverShadow = dark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.08)'
              return (
                <div key={i} style={{ background: dark ? f.darkBg : f.bg, border: `1px solid ${dark ? f.darkBorder : f.border}`, borderRadius: 24, padding: 36, boxShadow: defaultShadow, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = hoverShadow }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = defaultShadow }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: f.iconBg, borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 14px rgba(0,0,0,0.15)', color: '#fff' }}>
                    {f.icon}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#a5b4fc', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{f.num}</p>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: dark ? '#f1f5f9' : '#0f172a', marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: dark ? '#94a3b8' : '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '80px 32px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { value: 'Free', sub: 'Никаких платежей', icon: <Zap size={20} /> },
              { value: '100%', sub: 'Честный бартер', icon: <Repeat2 size={20} /> },
              { value: 'P2P', sub: 'Прямые сделки', icon: <Users size={20} /> },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.7 }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 900, marginBottom: 8, letterSpacing: '-1px' }}>{s.value}</div>
                <div style={{ color: '#c4b5fd', fontSize: 15, fontWeight: 500 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 32px', background: dark ? '#0f172a' : '#f8f9ff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: dark ? '1px solid rgba(99,102,241,0.25)' : 'none', borderRadius: 32, padding: '72px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 220, height: 220, background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.1, letterSpacing: '-1.5px' }}>
                Готов к первому{' '}
                <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>обмену?</span>
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>
                Присоединяйся и начни обмениваться вещами абсолютно бесплатно.
              </p>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', padding: '18px 40px', borderRadius: 16, fontSize: 17, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}>
                Создать аккаунт <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px', background: '#0f172a', textAlign: 'center' }}>
        <span style={{ fontSize: 14, color: '#64748b' }}>© {new Date().getFullYear()} Swop — платформа бартерного обмена</span>
      </footer>
    </div>
  )
}
