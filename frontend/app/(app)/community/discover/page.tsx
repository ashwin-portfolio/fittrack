'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { UserCard } from '@/components/community/UserCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useSearchUsers } from '@/hooks/useSocial'
import { useDebounce } from '@/hooks/useInfiniteScroll'

export default function DiscoverPage() {
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 300)
  const { data, isLoading } = useSearchUsers(debouncedQ || undefined)

  return (
    <div className="space-y-4">
      <PageHeader title="Discover" subtitle="Find and follow other FitTrack users" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or username…"
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title={debouncedQ ? `No users matching "${debouncedQ}"` : 'No users found'}
          description={debouncedQ ? 'Try a different name or username.' : 'Check back later.'}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.items.map((user) => (
            <UserCard key={user.username} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
