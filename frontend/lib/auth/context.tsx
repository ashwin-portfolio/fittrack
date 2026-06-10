'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/lib/api/auth'
import { profileApi } from '@/lib/api/profile'
import { clearTokens, getRefreshToken, setTokens } from '@/lib/auth/token'
import type { AuthUser, LoginRequest, RegisterRequest } from '@/types/auth'
import type { Profile } from '@/types/profile'

interface AuthContextValue {
  user: AuthUser | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const p = await profileApi.getMe()
      setProfile(p)
    } catch {
      // profile fetch failed — auth interceptor handles 401
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    await loadProfile()
  }, [loadProfile])

  useEffect(() => {
    async function init() {
      try {
        const me = await authApi.me()
        setUser(me)
        await loadProfile()
      } catch {
        // not authenticated — clear stale state
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [loadProfile])

  const login = useCallback(async (credentials: LoginRequest) => {
    const { access_token, refresh_token, user } = await authApi.login(credentials)
    setTokens(access_token, refresh_token)
    setUser(user)
    await loadProfile()
  }, [loadProfile])

  const register = useCallback(async (data: RegisterRequest) => {
    // Backend returns { message, user } — not tokens
    await authApi.register(data)
    // Auto-login immediately after to obtain tokens
    const { access_token, refresh_token, user } = await authApi.login({
      identifier: data.email,  // use email as identifier right after registration
      password: data.password,
    })
    setTokens(access_token, refresh_token)
    setUser(user)
    await loadProfile()
  }, [loadProfile])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) {
        await authApi.logout({ refresh_token: refreshToken })
      }
    } finally {
      clearTokens()
      setUser(null)
      setProfile(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
