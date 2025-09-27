import apiClient from './api'
import type { ApiResponse } from '../types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
  role: string
  address?: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  address?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  refreshToken?: string
  error?: string
  message?: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User, token: string, refreshToken?: string }>>('/auth/login', credentials)
      console.log('Login response:', response.data)
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token,
          refreshToken: response.data.data.refreshToken
        }
      } else {
        throw new Error(response.data.error || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User, token: string, refreshToken?: string }>>('/auth/register', data)
      console.log('Register response:', response.data)
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token,
          refreshToken: response.data.data.refreshToken
        }
      } else {
        throw new Error(response.data.error || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  async updateAddress(address: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/update-address', { address })
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data.user
        }
      } else {
        throw new Error(response.data.error || 'Failed to update address')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update address')
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<{ user: User, token: string, refreshToken?: string }>>('/auth/refresh', { refreshToken })
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token,
          refreshToken: response.data.data.refreshToken
        }
      } else {
        throw new Error(response.data.error || 'Token refresh failed')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Token refresh failed')
    }
  }

  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data.user
        }
      } else {
        throw new Error(response.data.error || 'Token verification failed')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Token verification failed')
    }
  }
}

export const authService = new AuthService()
