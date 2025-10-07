import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './components/Dashboard'
import ContractRegistration from './components/ContractRegistration'
import Monitoring from './components/Monitoring'
import Notifications from './components/Notifications'
import Audit from './components/Audit'
import InvestorDashboard from './components/InvestorDashboard'
import Payments from './components/Payments'
import InvestorPayments from './components/InvestorPayments'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useHealth } from './hooks'
import { useAuthGuard } from './hooks/useAuthGuard'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { WalletProvider } from './contexts/WalletContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { WagmiProviderWrapper } from './providers/WagmiProvider'
import { USER_ROLES } from './utils/constants'

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const { isHealthy } = useHealth()
  const { user, hasRole } = useAuth()
  const location = useLocation()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Get current tab from URL path
  const getCurrentTabFromPath = (pathname: string): string => {
    const path = pathname.replace('/', '')
    if (path === '' || path === 'dashboard') {
      return hasRole(USER_ROLES.INVESTOR) ? 'investidor_dashboard' : 'producer_dashboard'
    }
    return path
  }

  const currentTab = getCurrentTabFromPath(location.pathname)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          isHealthy={isHealthy}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        
        {/* Main content */}
        <div className="lg:ml-64">
        <Header
          isHealthy={isHealthy}
          onToggleSidebar={toggleSidebar}
        />
          <main className="pt-16 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                hasRole(USER_ROLES.INVESTOR) ? <InvestorDashboard /> : <Dashboard />
              } />
              <Route path="/contracts" element={<ContractRegistration />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/payments" element={
                hasRole(USER_ROLES.INVESTOR) ? <InvestorPayments /> : <Payments />
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function App(): React.JSX.Element {
  return (
    <Router>
      <WagmiProviderWrapper>
        <AuthProvider>
          <WalletProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </WalletProvider>
        </AuthProvider>
      </WagmiProviderWrapper>
    </Router>
  )
}

export default App
