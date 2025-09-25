import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ContractRegistration from './components/ContractRegistration'
import Monitoring from './components/Monitoring'
import Notifications from './components/Notifications'
import Audit from './components/Audit'
import ProducerDashboard from './components/ProducerDashboard'
import InvestorDashboard from './components/InvestorDashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthDemo from './components/auth/AuthDemo'
import { useHealth } from './hooks'
import { useAuthGuard } from './hooks/useAuthGuard'
import { AuthProvider } from './contexts/AuthContext'
import { WalletProvider } from './contexts/WalletContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { WagmiProviderWrapper } from './providers/WagmiProvider'
import { USER_ROLES } from './utils/constants'

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard')
  const { isHealthy } = useHealth()
  const { getAccessibleTabs } = useAuthGuard()

  const renderTabContent = (): React.JSX.Element => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />
      case 'contracts':
        return <ContractRegistration />
      case 'monitoring':
        return <Monitoring />
      case 'audit':
        return <Audit />
      case 'notifications':
        return <Notifications />
      case 'produtor':
        return <ProducerDashboard />
      case 'investidor':
        return <InvestorDashboard />
      default:
        return <Dashboard />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          isHealthy={isHealthy}
          accessibleTabs={getAccessibleTabs()}
        />
        <main>
          <AuthDemo />
          {renderTabContent()}
        </main>
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
