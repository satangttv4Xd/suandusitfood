import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { About, NotFound } from './pages/About'
import { Home } from './pages/Home'
import { MapPage } from './pages/MapPage'
import { Restaurant } from './pages/Restaurant'
import { Restaurants } from './pages/Restaurants'
import { AdminLayout, RequireAuth } from './pages/admin/AdminLayout'
import { AdminMenus } from './pages/admin/AdminMenus'
import { AdminRestaurants } from './pages/admin/AdminRestaurants'
import { AdminReviews } from './pages/admin/AdminReviews'
import { AdminSettings } from './pages/admin/AdminSettings'
import { Dashboard } from './pages/admin/Dashboard'
import { Login } from './pages/admin/Login'
import { RestaurantForm } from './pages/admin/RestaurantForm'

/** A client-side route change should start at the top, like a page load does. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />
        <Routes>
          {/* ------------------------------------------------ public */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="restaurant/:slug" element={<Restaurant />} />
            <Route path="categories" element={<Navigate to="/restaurants" replace />} />
            <Route path="map" element={<MapPage />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* ------------------------------------------------- admin */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="restaurants" element={<AdminRestaurants />} />
              <Route path="restaurants/new" element={<RestaurantForm />} />
              <Route path="restaurants/:id" element={<RestaurantForm />} />
              <Route path="menus" element={<AdminMenus />} />
              <Route path="categories" element={<Navigate to="/admin" replace />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
