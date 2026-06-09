'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthContext } from '@/lib/auth/context'
import { getApiErrorMessage } from '@/lib/api/client'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

export function useAuth() {
  const { user, profile, isAuthenticated, isLoading, login, register, logout, refreshProfile } =
    useAuthContext()
  const router = useRouter()

  async function handleLogin(credentials: LoginRequest) {
    try {
      await login(credentials)
      router.replace('/dashboard')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      throw error
    }
  }

  async function handleRegister(data: RegisterRequest) {
    try {
      await register(data)
      router.replace('/dashboard')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      throw error
    }
  }

  async function handleLogout() {
    try {
      await logout()
    } finally {
      router.replace('/login')
    }
  }

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshProfile,
  }
}
