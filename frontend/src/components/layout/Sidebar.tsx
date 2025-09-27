import React from 'react'
import { FaWater, FaChartLine, FaFileContract, FaBell, FaCircle, FaShieldAlt, FaTimes, FaDollarSign } from 'react-icons/fa'
import type { IconType } from 'react-icons'
import { useAuth } from '../../contexts/AuthContext'

interface Tab {
  id: string
  label: string
  icon: IconType
  roles?: string[]
}

interface SidebarProps {
  currentTab: string
  onTabChange: (tab: string) => void
  isHealthy: boolean
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ 
  currentTab, 
  onTabChange, 
  isHealthy = false, 
  isOpen,
  onToggle
}: SidebarProps): React.JSX.Element {
  const { user, hasRole } = useAuth()

  const getAvailableTabs = (): Tab[] => {
   
    const allTabs: Tab[] = [
      { id: 'producer_dashboard', label: 'Dashboard', icon: FaChartLine, roles: ['PRODUCER'] },
      { id: 'investidor_dashboard', label: 'Dashboard', icon: FaChartLine, roles: ['INVESTOR'] },
      { id: 'contracts', label: 'Contracts', icon: FaFileContract, roles: ['PRODUCER', 'INVESTOR'] },
      { id: 'monitoring', label: 'Monitoring', icon: FaWater, roles: ['PRODUCER'] },
      { id: 'payments', label: 'Payments', icon: FaDollarSign, roles: ['PRODUCER', 'INVESTOR'] },
      { id: 'audit', label: 'Audit', icon: FaShieldAlt, roles: ['PRODUCER', 'INVESTOR'] },
      { id: 'notifications', label: 'Notifications', icon: FaBell, roles: ['PRODUCER', 'INVESTOR'] }
    ]
    if (!user) {
      return allTabs.filter(tab => !tab.roles || tab.roles.length === 0)
    }

    const filteredTabs = allTabs.filter(tab => {
      if (!tab.roles || tab.roles.length === 0) {
        return true
      }
      
      const hasAccess = tab.roles.some(role => hasRole(role))
      return hasAccess
    })
    
    return filteredTabs
  }

  const tabs = getAvailableTabs()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-gradient-to-b to-[#94b9ff] from-[#cdffd8] 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-40
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                <img src="/src/assets/logo.svg" alt="W.A.T.A. Logo" className="h-80 w-80" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-500">W.A.T.A.</h1>
                <div className="flex items-center">
                  <FaCircle
                    className={`h-2 w-2 ${isHealthy ? 'text-green-300' : 'text-red-300'}`}
                  />
                  <span className="ml-1 text-xs text-gray-900/80">
                    {isHealthy ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-white hover:text-white/80 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id)
                    onToggle() // Close sidebar on mobile after selection
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                    currentTab === tab.id
                      ? 'bg-white/20 text-gray-500 shadow-lg'
                      : 'text-gray-500/80 hover:text-gray-500 hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <div className="text-xs text-white/60 text-center">
              W.A.T.A. Chain v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
