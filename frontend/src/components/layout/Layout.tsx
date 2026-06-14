import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div key={location.pathname} className="animate-page-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
