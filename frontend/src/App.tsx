import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ContractRegistration from './components/ContractRegistration'
import Monitoring from './components/Monitoring'
import Notifications from './components/Notifications'
import { useHealth } from './hooks'

function App(): JSX.Element {
  const [currentTab, setCurrentTab] = useState<string>('dashboard')
  const { isHealthy } = useHealth()

  const renderTabContent = (): JSX.Element => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />
      case 'contracts':
        return <ContractRegistration />
      case 'monitoring':
        return <Monitoring />
      case 'notifications':
        return <Notifications />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isHealthy={isHealthy}
      />
      <main>
        {renderTabContent()}
      </main>
    </div>
  )
}

export default App
