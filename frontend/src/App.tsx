import { useState, useEffect } from 'react'
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
  const [currentTab, setCurrentTab] = useState<string>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const { isHealthy } = useHealth()
  const { user, hasRole } = useAuth()

  // Set default dashboard based on user role
  useEffect(() => {
    if (user) {
      if (hasRole(USER_ROLES.INVESTOR)) {
        setCurrentTab('investidor_dashboard')
      } else if (hasRole(USER_ROLES.PRODUCER)) {
        setCurrentTab('producer_dashboard')
      }
    }
  }, [user, hasRole])


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const renderTabContent = (): React.JSX.Element => {
    switch (currentTab) {
      case 'producer_dashboard':
        return <Dashboard />
      case 'investidor_dashboard':
        return <InvestorDashboard />
      case 'contracts':
        return <ContractRegistration />
      case 'monitoring':
        return <Monitoring />
      case 'audit':
        return <Audit />
      case 'notifications':
        return <Notifications />
      case 'payments':
        return hasRole(USER_ROLES.INVESTOR) ? <InvestorPayments /> : <Payments />
      default:
        return <Dashboard />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          isHealthy={isHealthy}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        
        {/* Main content */}
        <div className="lg:ml-64">
          <Header
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            isHealthy={isHealthy}
            onToggleSidebar={toggleSidebar}
          />
          <main className="pt-16 p-6">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function App(): React.JSX.Element {
  return (
    <WagmiProviderWrapper>
      <AuthProvider>
        <WalletProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </WalletProvider>
      </AuthProvider>
    </WagmiProviderWrapper>
  )
}

export default App
