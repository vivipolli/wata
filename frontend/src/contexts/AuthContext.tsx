import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { USER_ROLES } from '../utils/constants'
import { authService } from '../services/auth'

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
  updateUserAddress: (address: string) => Promise<void>
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
    const checkStoredAuth = async () => {
      const storedUser = localStorage.getItem('wata_user')
      const storedToken = localStorage.getItem('wata_token')
      
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser)
          
          // Verify token with backend
          const result = await authService.verifyToken(storedToken)
          
          if (result.success && result.user) {
            const userData: User = {
              id: result.user.id.toString(),
              email: result.user.email,
              name: result.user.name,
              role: result.user.role,
              address: result.user.address,
              isAuthenticated: true
            }
            setUser(userData)
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('wata_user')
            localStorage.removeItem('wata_token')
            localStorage.removeItem('wata_refresh_token')
          }
        } catch (error: any) {
          console.error('Error verifying stored auth:', error)
          
          // Check if it's a network error or server unavailable
          if (error.message?.includes('Network Error') || 
              error.message?.includes('timeout') ||
              error.response?.status >= 500) {
            // If backend is unavailable, use stored user data as fallback
            try {
              const parsedUser = JSON.parse(storedUser)
              const userData: User = {
                id: parsedUser.id,
                email: parsedUser.email,
                name: parsedUser.name,
                role: parsedUser.role,
                address: parsedUser.address,
                isAuthenticated: true
              }
              setUser(userData)
              console.warn('Backend unavailable, using cached user data')
            } catch (parseError) {
              // If stored data is corrupted, clear everything
              localStorage.removeItem('wata_user')
              localStorage.removeItem('wata_token')
              localStorage.removeItem('wata_refresh_token')
            }
          } else {
            // For other errors (401, 403, etc.), clear storage
            localStorage.removeItem('wata_user')
            localStorage.removeItem('wata_token')
            localStorage.removeItem('wata_refresh_token')
          }
        }
      }
      setIsLoading(false)
    }
    
    checkStoredAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const result = await authService.login({ email, password })
      
      if (result.success && result.user && result.token) {
        const userData: User = {
          id: result.user.id.toString(),
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          address: result.user.address,
          isAuthenticated: true
        }

        setUser(userData)
        localStorage.setItem('wata_user', JSON.stringify(userData))
        localStorage.setItem('wata_token', result.token)
        
        if (result.refreshToken) {
          localStorage.setItem('wata_refresh_token', result.refreshToken)
        }
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (email: string, name: string, password: string, role: string): Promise<void> => {
    try {
      const result = await authService.register({ email, name, password, role })
      
      if (result.success && result.user && result.token) {
        const userData: User = {
          id: result.user.id.toString(),
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          address: result.user.address,
          isAuthenticated: true
        }

        setUser(userData)
        localStorage.setItem('wata_user', JSON.stringify(userData))
        localStorage.setItem('wata_token', result.token)
        
        if (result.refreshToken) {
          localStorage.setItem('wata_refresh_token', result.refreshToken)
        }
      } else {
        throw new Error(result.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const updateUserAddress = async (address: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const result = await authService.updateAddress(address)
      
      if (result.success && result.user) {
        const updatedUser = {
          ...user,
          address: result.user.address
        }
        setUser(updatedUser)
        localStorage.setItem('wata_user', JSON.stringify(updatedUser))
      } else {
        throw new Error(result.error || 'Failed to update address')
      }
    } catch (error) {
      console.error('Error updating user address:', error)
      throw error
    }
  }

  const logout = (): void => {
    setUser(null)
    localStorage.removeItem('wata_user')
    localStorage.removeItem('wata_token')
    localStorage.removeItem('wata_refresh_token')
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
    updateUserAddress,
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
