import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

const AuthDemo: React.FC = () => {
  const { register, login, logout, user, isAuthenticated } = useAuth()
  const { showNotification } = useNotifications()
  const [demoEmail, setDemoEmail] = useState('demo@wata.com')
  const [demoPassword, setDemoPassword] = useState('password123')

  const handleQuickRegister = async () => {
    try {
      await register(demoEmail, 'Demo User', demoPassword, 'PRODUCER')
      showNotification({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to W.A.T.A. Chain!'
      })
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error instanceof Error ? error.message : 'Something went wrong'
      })
    }
  }

  const handleQuickLogin = async () => {
    try {
      await login(demoEmail, demoPassword)
      showNotification({
        type: 'success',
        title: 'Welcome Back!',
        message: 'You are now signed in to W.A.T.A. Chain'
      })
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Login Failed',
        message: error instanceof Error ? error.message : 'Invalid credentials'
      })
    }
  }

  const handleLogout = () => {
    logout()
    showNotification({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been signed out successfully'
    })
  }

  if (isAuthenticated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-green-800">Demo Mode Active</h3>
            <p className="text-xs text-green-600">
              Logged in as {user?.name} ({user?.role})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-blue-800 mb-2">Quick Demo</h3>
      <p className="text-xs text-blue-600 mb-3">
        Try the authentication system with demo credentials
      </p>
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="email"
            value={demoEmail}
            onChange={(e) => setDemoEmail(e.target.value)}
            placeholder="demo@wata.com"
            className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="password"
            value={demoPassword}
            onChange={(e) => setDemoPassword(e.target.value)}
            placeholder="password123"
            className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleQuickRegister}
            className="flex-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
          >
            Quick Register
          </button>
          <button
            onClick={handleQuickLogin}
            className="flex-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
          >
            Quick Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthDemo
