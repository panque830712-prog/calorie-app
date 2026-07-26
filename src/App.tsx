import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { isFirstTime, requestPersistentStorage } from './db/database'
import Setup from './pages/Setup'
import Home from './pages/Home'
import AddMeal from './pages/AddMeal'
import Records from './pages/Records'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Privacy from './pages/Privacy'

function AppRoutes() {
  const [ready, setReady] = useState(false)
  const [firstTime, setFirstTime] = useState(false)

  useEffect(() => {
    async function init() {
      await requestPersistentStorage()
      const ft = await isFirstTime()
      setFirstTime(ft)
      setReady(true)
    }
    init()
  }, [])

  if (!ready) {
    return (
      <div className="min-h-dvh bg-[#f5f0e8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#4caf7d] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🥗</span>
          </div>
          <p className="text-[#8a8a8a] text-sm">載入中…</p>
        </div>
      </div>
    )
  }

  if (firstTime) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add-meal" element={<AddMeal />} />
      <Route path="/records" element={<Records />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/calorie-app">
      <AppRoutes />
    </BrowserRouter>
  )
}
