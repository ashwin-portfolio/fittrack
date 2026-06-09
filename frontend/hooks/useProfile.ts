'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { profileApi } from '@/lib/api/profile'
import { getApiErrorMessage } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { useAuthContext } from '@/lib/auth/context'
import type { UpdateProfileRequest } from '@/types/profile'

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: profileApi.getMe,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: queryKeys.profile.public(username),
    queryFn: () => profileApi.getPublic(username),
    enabled: Boolean(username),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { refreshProfile } = useAuthContext()
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateMe(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me() })
      await refreshProfile()
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
