import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { USER_ROLES } from '../utils/constants'

export interface User {
  id: string
  email: string
  name: string
  role: string
  address?: string
  isAuthenticated: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string, role: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored authentication on mount
    const storedUser = localStorage.getItem('wata_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('wata_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call for login
    // In a real app, this would call your backend API
    const mockUsers = JSON.parse(localStorage.getItem('wata_users') || '[]')
    const user = mockUsers.find((u: any) => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const newUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      address: user.address,
      isAuthenticated: true
    }

    setUser(newUser)
    localStorage.setItem('wata_user', JSON.stringify(newUser))
  }

  const register = async (email: string, name: string, password: string, role: string): Promise<void> => {
    // Simulate API call for registration
    // In a real app, this would call your backend API
    const mockUsers = JSON.parse(localStorage.getItem('wata_users') || '[]')
    
    // Check if user already exists
    const existingUser = mockUsers.find((u: any) => u.email === email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      password, // In a real app, this would be hashed
      role,
      address: `0.0.${Math.floor(Math.random() * 1000000)}` // Generate mock Hedera address
    }

    mockUsers.push(newUser)
    localStorage.setItem('wata_users', JSON.stringify(mockUsers))

    // Auto-login after registration
    await login(email, password)
  }

  const logout = (): void => {
    setUser(null)
    localStorage.removeItem('wata_user')
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user?.isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
