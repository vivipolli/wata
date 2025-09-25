import React, { createContext, useContext, useState, ReactNode } from 'react'
import NotificationToast, { NotificationToastProps } from '../components/common/NotificationToast'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, 'id'>) => void
  hideNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id
    }
    
    setNotifications(prev => [...prev, newNotification])
  }

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const value: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render all notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            {...notification}
            onClose={hideNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
