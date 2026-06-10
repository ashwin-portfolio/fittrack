import { apiClient } from '@/lib/api/client'
import type {
  OnboardingRequest,
  OnboardingResponse,
  Profile,
  PublicUserProfile,
  UpdateProfileRequest,
} from '@/types/profile'

export const profileApi = {
  getMe: async (): Promise<Profile> => {
    const res = await apiClient.get<Profile>('/profile/me')
    return res.data
  },

  updateMe: async (data: UpdateProfileRequest): Promise<Profile> => {
    const res = await apiClient.put<Profile>('/profile/me', data)
    return res.data
  },

  completeOnboarding: async (data: OnboardingRequest): Promise<OnboardingResponse> => {
    const res = await apiClient.put<OnboardingResponse>('/profile/onboarding', data)
    return res.data
  },

  getPublic: async (username: string): Promise<PublicUserProfile> => {
    const res = await apiClient.get<PublicUserProfile>(`/users/${username}`)
    return res.data
  },
}
