'use client'

import { formatDistanceToNow } from 'date-fns'
import { Dumbbell, Utensils, Weight, Users, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/shared/Avatar'
import { usePublicProfile } from '@/hooks/useProfile'
import { useFollow } from '@/hooks/useSocial'
import { useAuthContext } from '@/lib/auth/context'
import type { RecentActivity } from '@/types/profile'

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  workout: <Dumbbell className="h-3.5 w-3.5" />,
  meal: <Utensils className="h-3.5 w-3.5" />,
  weight: <Weight className="h-3.5 w-3.5" />,
}

function ActivityRow({ activity }: { activity: RecentActivity }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 text-muted-foreground">
        {ACTIVITY_ICON[activity.activity_type] ?? <Dumbbell className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.summary}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4">
      <span className="text-xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

interface PublicProfileViewProps {
  username: string
}

export function PublicProfileView({ username }: PublicProfileViewProps) {
  const { user } = useAuthContext()
  const { data: profile, isLoading } = usePublicProfile(username)
  const follow = useFollow(username)

  const isOwnProfile = user?.username === username

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center gap-4 pt-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Users className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-medium">User not found</p>
        <p className="text-sm text-muted-foreground mt-1">@{username} doesn&apos;t exist.</p>
      </div>
    )
  }

  const isPrivate = !profile.is_public && !profile.is_following && !isOwnProfile

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Avatar + identity */}
      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <Avatar name={profile.full_name} username={username} size="xl" />

        <div className="space-y-0.5">
          <h1 className="text-xl font-bold">{profile.full_name}</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground max-w-xs">{profile.bio}</p>
        )}

        {/* Follow button — only show for other users */}
        {!isOwnProfile && (
          <Button
            size="sm"
            variant={profile.is_following ? 'outline' : 'default'}
            disabled={follow.isPending}
            onClick={() => follow.mutate(profile.is_following ?? false)}
          >
            {profile.is_following ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      {/* Social stats */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-around divide-x">
            <StatBox label="Followers" value={profile.follower_count} />
            <StatBox label="Following" value={profile.following_count} />
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      {isPrivate ? (
        <Card>
          <CardContent className="py-10 flex flex-col items-center gap-2 text-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-sm">This account is private</p>
            <p className="text-xs text-muted-foreground">
              Follow {profile.full_name} to see their activity.
            </p>
          </CardContent>
        </Card>
      ) : profile.recent_activities.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No public activity yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4 pb-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Recent Activity
            </p>
            <div className="divide-y">
              {profile.recent_activities.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
