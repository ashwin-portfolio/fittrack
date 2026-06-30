import axios, { type InternalAxiosRequestConfig } from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/lib/auth/token'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// Attach access token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Token refresh queue — prevents multiple concurrent refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: InternalAxiosRequestConfig = error.config

    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return apiClient(original)
        })
        .catch((err) => Promise.reject(err))
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const { access_token, refresh_token } = data
      setTokens(access_token, refresh_token)
      original.headers.Authorization = `Bearer ${access_token}`
      processQueue(null, access_token)

      return apiClient(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearTokens()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // No response = network-level failure (backend unreachable, CORS blocked, timeout)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
      return 'Cannot connect to the server. Make sure the backend is running.'
    }

    const { status, data } = error.response

    // Use the detail message from the response body when present
    const detail = data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail.map((e: { msg?: string }) => e.msg ?? String(e)).join(', ')
    }

    // Status-based fallbacks
    switch (status) {
      case 400: return 'Bad request. Please check your input.'
      case 401: return 'Invalid credentials or your session has expired.'
      case 403: return 'You do not have permission to do this.'
      case 404: return 'Not found.'
      case 409: return 'This already exists.'
      case 422: return 'Validation error. Please check your input.'
      case 429: return 'Too many requests. Please slow down and try again.'
      case 500:
      case 502:
      case 503: return 'Server error. Please try again in a moment.'
      default:  return `Request failed (${status}).`
    }
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong.'
}
