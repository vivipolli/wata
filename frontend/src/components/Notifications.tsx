import { useState } from 'react'
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import type { NotificationsProps, Notification } from '../types'
import type { IconType } from 'react-icons'

export default function Notifications({}: NotificationsProps) {
  const [mockNotifications, setMockNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'payment',
      title: 'Payment Processed',
      message: 'Payment of 5000 HBAR has been processed for Agreement #1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'compliance',
      title: 'Compliance Alert',
      message: 'Water quality below threshold for Agreement #2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'audit',
      title: 'Audit Recorded',
      message: 'New audit hash recorded on blockchain',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: true
    }
  ])

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap: Record<Notification['type'], IconType> = {
      payment: FaCheckCircle,
      compliance: FaExclamationTriangle,
      audit: FaInfoCircle,
      info: FaBell
    }
    
    const colorMap: Record<Notification['type'], string> = {
      payment: 'text-green-500',
      compliance: 'text-yellow-500',
      audit: 'text-blue-500',
      info: 'text-gray-500'
    }
    
    const Icon = iconMap[type]
    const color = colorMap[type]
    
    return <Icon className={`h-5 w-5 ${color}`} />
  }

  const markAsRead = (id: number): void => {
    setMockNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const unreadCount = mockNotifications.filter(n => !n.read).length

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-2 text-gray-600">
                Stay updated with system events and alerts
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {mockNotifications.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <FaBell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Notifications
              </h3>
              <p className="text-gray-500">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white border rounded-lg p-4 transition-all ${
                  notification.read ? 'opacity-75' : 'shadow-md'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${
                        notification.read ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`mt-1 text-sm ${
                      notification.read ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Notification Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-blue-800">Payment Processed</span>
            </div>
            <div className="flex items-center">
              <FaExclamationTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-blue-800">Compliance Alert</span>
            </div>
            <div className="flex items-center">
              <FaInfoCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-blue-800">Audit Recorded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
