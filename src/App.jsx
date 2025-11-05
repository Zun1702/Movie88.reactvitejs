import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadUserFromStorage } from './redux/thunks/auth/authThunks.jsx'
import './App.css'
import AdminLogin from './pages/AdminLogin'
import StaffDashboard from './pages/StaffDashboard'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  const dispatch = useDispatch();

  // Load user from localStorage on app start
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Home Route - Redirect to Login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Staff Dashboard Route - Protected */}
        <Route 
          path="/staff/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard Route - Protected - TODO */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
                  <p className="text-gray-400">Coming soon...</p>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* 404 Route - Redirect to Login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
