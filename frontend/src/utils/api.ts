import axios from 'axios'
import { useToast } from 'vue-toastification'
import router from '../router'

const toast = useToast()

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          handleAuthError()
          return Promise.reject(error)
        }
        
        // Try to refresh the token
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken,
        })
        
        const { token, refreshToken: newRefreshToken } = response.data
        
        // Update tokens in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`
        
        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        handleAuthError()
        return Promise.reject(refreshError)
      }
    }
    
    // Handle other errors
    handleApiError(error)
    return Promise.reject(error)
  }
)

// Handle authentication errors
const handleAuthError = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  
  if (router.currentRoute.value.name !== 'Login' && router.currentRoute.value.name !== 'Signup') {
    toast.error('Your session has expired. Please log in again.')
    router.push({ name: 'Login' })
  }
}

// Handle API errors
const handleApiError = (error: any) => {
  const errorMessage = error.response?.data?.message || 'An error occurred'
  
  // Don't show toast for 401 errors (already handled)
  if (error.response?.status !== 401) {
    toast.error(errorMessage)
  }
  
  // Handle forbidden errors
  if (error.response?.status === 403) {
    router.push({ name: 'Forbidden' })
  }
}

export default api