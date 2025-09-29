import axios, { AxiosInstance, AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wata_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('wata_refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })

          if (response.data.success) {
            const { token, refreshToken: newRefreshToken } = response.data.data
            localStorage.setItem('wata_token', token)
            if (newRefreshToken) {
              localStorage.setItem('wata_refresh_token', newRefreshToken)
            }

            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Don't auto-logout, let the component handle the error
          return Promise.reject(error)
        }
      } else {
        console.error('No refresh token available')
        // Don't auto-logout, let the component handle the error
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
