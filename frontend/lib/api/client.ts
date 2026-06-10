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

    if (error.response?.status !== 401 || original._retry) {
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
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return detail[0]?.msg ?? 'Something went wrong'
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
