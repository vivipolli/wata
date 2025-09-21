import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and auth
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('🔒 Unauthorized access - redirecting to login')
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('🔥 Server error:', error.response?.data)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
