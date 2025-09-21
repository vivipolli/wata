import { FaWater, FaChartLine, FaFileContract, FaBell } from 'react-icons/fa'

export default function Header({ currentTab, onTabChange }) {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
        { id: 'contracts', label: 'Contracts', icon: FaFileContract },
        { id: 'monitoring', label: 'Monitoring', icon: FaWater },
        { id: 'notifications', label: 'Notifications', icon: FaBell }
    ]

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <FaWater className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">
                                W.A.T.A. Chain
                            </span>
                        </div>
                    </div>

                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === tab.id
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>
        </header>
    )
}
