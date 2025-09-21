import { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ContractRegistration from './components/ContractRegistration'
import Monitoring from './components/Monitoring'
import Notifications from './components/Notifications'

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [agreements, setAgreements] = useState([])
  const [readings, setReadings] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetchAgreements()
    fetchRecentReadings()
  }, [])

  const fetchAgreements = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agreements')
      const data = await response.json()
      if (data.success) {
        setAgreements(data.agreements)
      }
    } catch (error) {
      console.error('Error fetching agreements:', error)
    }
  }

  const fetchRecentReadings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/readings/recent?limit=20')
      const data = await response.json()
      if (data.success) {
        setReadings(data.readings)
      }
    } catch (error) {
      console.error('Error fetching readings:', error)
    }
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard agreements={agreements} readings={readings} onRefresh={fetchRecentReadings} />
      case 'contracts':
        return <ContractRegistration onAgreementCreated={fetchAgreements} />
      case 'monitoring':
        return <Monitoring agreements={agreements} readings={readings} onRefresh={fetchRecentReadings} />
      case 'notifications':
        return <Notifications notifications={notifications} />
      default:
        return <Dashboard agreements={agreements} readings={readings} onRefresh={fetchRecentReadings} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      <main>
        {renderTabContent()}
      </main>
    </div>
  )
}

export default App
