import React, { useState } from 'react'
import { FaWater, FaChartLine, FaFileContract, FaBell, FaCircle, FaShieldAlt, FaUserTie, FaCoins, FaBars, FaTimes, FaDollarSign } from 'react-icons/fa'
import type { HeaderProps } from '../../types'
import type { IconType } from 'react-icons'
import { useAuth } from '../../contexts/AuthContext'
import { USER_ROLES } from '../../utils/constants'

interface Tab {
  id: string
  label: string
  icon: IconType
}

interface AccessibleTab {
  id: string
  label: string
  roles: string[]
}

interface SidebarProps {
  currentTab: string
  onTabChange: (tab: string) => void
  isHealthy: boolean
  accessibleTabs?: AccessibleTab[]
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ 
  currentTab, 
  onTabChange, 
  isHealthy = false, 
  accessibleTabs = [],
  isOpen,
  onToggle
}: SidebarProps): React.JSX.Element {
  const { user, hasRole } = useAuth()

  // Use accessible tabs if provided, otherwise filter based on user role
  const getAvailableTabs = (): Tab[] => {
    const allTabs: Tab[] = [
      { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
      { id: 'contracts', label: 'Contracts', icon: FaFileContract },
      { id: 'monitoring', label: 'Monitoring', icon: FaWater },
      { id: 'payments', label: 'Payments', icon: FaDollarSign },
      { id: 'audit', label: 'Audit', icon: FaShieldAlt },
      { id: 'investidor', label: 'Investor', icon: FaCoins },
      { id: 'notifications', label: 'Notifications', icon: FaBell }
    ]

    // If accessible tabs are provided, use them
    if (accessibleTabs.length > 0) {
      return allTabs.filter(tab => 
        accessibleTabs.some(accessibleTab => accessibleTab.id === tab.id)
      )
    }

    // Fallback to role-based filtering
    if (!user) return allTabs.slice(0, 4) // Show basic tabs for unauthenticated users

    // Role-based tab filtering
    if (hasRole(USER_ROLES.PRODUCER)) {
      return allTabs.filter(tab => ['dashboard', 'contracts', 'monitoring', 'payments', 'audit', 'notifications'].includes(tab.id))
    } else if (hasRole(USER_ROLES.INVESTOR)) {
      return allTabs.filter(tab => ['dashboard', 'investidor', 'monitoring', 'audit', 'notifications'].includes(tab.id))
    }

    return allTabs.slice(0, 4) // Default fallback
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
        fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-500 to-green-500 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:fixed lg:z-40
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FaWater className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">W.A.T.A.</h1>
                <div className="flex items-center">
                  <FaCircle
                    className={`h-2 w-2 ${isHealthy ? 'text-green-300' : 'text-red-300'}`}
                  />
                  <span className="ml-1 text-xs text-white/80">
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
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentTab === tab.id
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
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
