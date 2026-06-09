'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { usePublicProfile } from '@/hooks/useProfile'
import { useFollow } from '@/hooks/useSocial'
import { useAuthContext } from '@/lib/auth/context'
import { formatRelative } from '@/lib/utils/format'

const ACTIVITY_LABELS: Record<string, string> = {
  workout: 'Workout',
  meal: 'Meal',
  weight: 'Weight',
}

interface Props {
  params: Promise<{ username: string }>
}

export default function PublicProfilePage({ params }: Props) {
  const { username } = use(params)
  const { user } = useAuthContext()
  const { data: profile, isLoading, isError } = usePublicProfile(username)
  const { mutate: toggleFollow, isPending } = useFollow(username)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-2xl py-12 px-4">
        <EmptyState
          title="Profile not found"
          description={`@${username} doesn't exist or their profile is private.`}
          action={
            <Link href="/community/discover">
              <Button variant="outline">Back to Discover</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const isOwnProfile = user?.username === username

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      <Link
        href="/community/discover"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Discover
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-4">
        <Avatar name={profile.full_name} username={profile.username} size="lg" />

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{profile.full_name}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}

          <div className="mt-3 flex gap-4 text-sm">
            <span>
              <strong>{profile.follower_count.toLocaleString()}</strong>{' '}
              <span className="text-muted-foreground">followers</span>
            </span>
            <span>
              <strong>{profile.following_count.toLocaleString()}</strong>{' '}
              <span className="text-muted-foreground">following</span>
            </span>
          </div>
        </div>

        {!isOwnProfile && user && (
          <Button
            size="sm"
            variant={profile.is_following ? 'outline' : 'default'}
            disabled={isPending}
            onClick={() => toggleFollow(profile.is_following ?? false)}
            className="shrink-0"
          >
            {profile.is_following ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      {/* Recent activity */}
      {profile.recent_activities.length > 0 ? (
        <div className="space-y-3">
          <h2 className="font-semibold">Recent activity</h2>
          <div className="space-y-2">
            {profile.recent_activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {ACTIVITY_LABELS[activity.activity_type] ?? activity.activity_type}
                  </Badge>
                  <span className="text-sm">{activity.summary}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelative(activity.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {profile.is_public ? 'No public activity yet.' : 'This profile is private.'}
          </p>
        </div>
      )}
    </div>
  )
}
