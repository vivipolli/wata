import { FaBars } from 'react-icons/fa'
import type { HeaderProps } from '../types'
import { useAuth } from '../contexts/AuthContext'
import UserMenu from './auth/UserMenu'
import WalletConnectButton from './wallet/WalletConnectButton'

interface HeaderPropsExtended extends HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ 
  isHealthy = false,
  onToggleSidebar
}: HeaderPropsExtended): React.JSX.Element {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white shadow-sm border-b border-gray-100 z-30">
      <div className="w-full px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Menu button */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden text-gray-600 hover:text-[#94b9ff] transition-colors p-2 rounded-lg hover:bg-gray-50"
            >
              <FaBars className="h-5 w-5" />
            </button>
          </div>

          {/* Right side - Wallet and User Menu */}
          <div className="flex items-center space-x-4">
            <WalletConnectButton />
            {user && <UserMenu />}
          </div>
        </div>
      </div>
    </header>
  )
}
