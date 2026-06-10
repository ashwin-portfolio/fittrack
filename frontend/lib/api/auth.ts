import { apiClient } from '@/lib/api/client'
import type { AuthUser, LoginRequest, LogoutRequest, RegisterRequest, RegisterResponse, TokenResponse } from '@/types/auth'

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/auth/login', data)
    return res.data
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await apiClient.post<RegisterResponse>('/auth/register', data)
    return res.data
  },

  logout: async (data: LogoutRequest): Promise<void> => {
    await apiClient.post('/auth/logout', data)
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return res.data
  },

  me: async (): Promise<AuthUser> => {
    const res = await apiClient.get<{ id: string; email: string; username: string }>('/profile/me')
    const { id, email, username } = res.data
    return { id, email, username }
  },
}
