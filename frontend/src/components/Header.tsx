import { FaWater, FaChartLine, FaFileContract, FaBell, FaCircle, FaShieldAlt, FaUserTie, FaCoins } from 'react-icons/fa'
import type { HeaderProps } from '../types'
import type { IconType } from 'react-icons'
import { useAuth } from '../contexts/AuthContext'
import { USER_ROLES } from '../utils/constants'
import UserMenu from './auth/UserMenu'
import WalletConnectButton from './wallet/WalletConnectButton'

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

export default function Header({ 
  currentTab, 
  onTabChange, 
  isHealthy = false, 
  accessibleTabs = [] 
}: HeaderProps & { accessibleTabs?: AccessibleTab[] }): React.JSX.Element {
  const { user, hasRole } = useAuth()

  // Use accessible tabs if provided, otherwise filter based on user role
  const getAvailableTabs = (): Tab[] => {
    const allTabs: Tab[] = [
      { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
      { id: 'contracts', label: 'Contracts', icon: FaFileContract },
      { id: 'monitoring', label: 'Monitoring', icon: FaWater },
      { id: 'audit', label: 'Audit', icon: FaShieldAlt },
      { id: 'produtor', label: 'Producer', icon: FaUserTie },
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
      return allTabs.filter(tab => ['dashboard', 'produtor', 'monitoring', 'audit', 'notifications'].includes(tab.id))
    } else if (hasRole(USER_ROLES.INVESTOR)) {
      return allTabs.filter(tab => ['dashboard', 'investidor', 'monitoring', 'audit', 'notifications'].includes(tab.id))
    }

    return allTabs.slice(0, 4) // Default fallback
  }

  const tabs = getAvailableTabs()

  return (
    <header className="bg-gradient-to-r from-blue-500 to-green-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FaWater className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">
                    W.A.T.A. Chain
                  </span>
                  <div className="flex items-center mt-1">
                    <FaCircle
                      className={`h-2 w-2 ${isHealthy ? 'text-green-300' : 'text-red-300'}`}
                    />
                    <span className="ml-1 text-xs text-white/80">
                      {isHealthy ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentTab === tab.id
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
            
            <div className="flex items-center space-x-3">
              <WalletConnectButton />
              {user && <UserMenu />}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
