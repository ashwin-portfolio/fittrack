'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthContext } from '@/lib/auth/context'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
