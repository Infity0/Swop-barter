import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store'
import { AuthInitializer } from './components/AuthInitializer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Layout } from './components/layout/Layout'
import { SplashScreen } from './components/SplashScreen'
import { FloatingThemeToggle } from './components/FloatingThemeToggle'
import { ThemeProvider } from './hooks/useTheme'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { BrowsePage } from './pages/BrowsePage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { CreateItemPage } from './pages/CreateItemPage'
import { EditItemPage } from './pages/EditItemPage'
import { MyItemsPage } from './pages/MyItemsPage'
import { TradesPage } from './pages/TradesPage'
import { TradeDetailPage } from './pages/TradeDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { AdminPage } from './pages/AdminPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { MatchesPage } from './pages/MatchesPage'

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('swop_splash_shown'))

  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          {showSplash && (
            <SplashScreen
              onFinish={() => {
                sessionStorage.setItem('swop_splash_shown', '1')
                setShowSplash(false)
              }}
            />
          )}
          <AuthInitializer />
          <FloatingThemeToggle />
          <Toaster position="top-right" />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<Layout />}>
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/items/:id" element={<ItemDetailPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/items/new" element={<CreateItemPage />} />
                <Route path="/items/:id/edit" element={<EditItemPage />} />
                <Route path="/my-items" element={<MyItemsPage />} />
                <Route path="/trades" element={<TradesPage />} />
                <Route path="/trades/:id" element={<TradeDetailPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

