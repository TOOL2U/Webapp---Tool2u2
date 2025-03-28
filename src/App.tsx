import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useEffect } from 'react'
import { useNotification } from './contexts/NotificationContext'

function App() {
  const { requestPermission, notificationPermissionStatus } = useNotification();

  // Request notification permission when the app loads
  useEffect(() => {
    if (notificationPermissionStatus === 'default') {
      // We don't auto-request to avoid annoying users
      // User will need to click the button on the orders page
    }
  }, [notificationPermissionStatus, requestPermission]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<OrdersPage />} />
        <Route path="orders" element={<OrdersPage />} />
      </Route>
    </Routes>
  )
}

export default App
