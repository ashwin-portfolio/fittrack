import { apiClient } from '@/lib/api/client'
import type {
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  TokenResponse,
} from '@/types/auth'

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
    const res = await apiClient.get<{ id: string; email: string; username: string; is_email_verified: boolean }>('/profile/me')
    const { id, email, username, is_email_verified } = res.data
    return { id, email, username, is_email_verified }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/forgot-password', data)
    return res.data
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/reset-password', data)
    return res.data
  },

  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const res = await apiClient.get<MessageResponse>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    return res.data
  },

  resendVerification: async (): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>('/auth/resend-verification')
    return res.data
  },
}
