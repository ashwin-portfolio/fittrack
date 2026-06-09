'use client'

import Link from 'next/link'
import { Calendar, Globe, Lock, Pencil, Ruler, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/shared/Avatar'
import { useMyProfile } from '@/hooks/useProfile'
import { useActiveGoal } from '@/hooks/useGoals'
import { useAuthContext } from '@/lib/auth/context'

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  build_muscle: 'Build Muscle',
  maintain_weight: 'Maintain Weight',
  improve_endurance: 'Improve Endurance',
  general_fitness: 'General Fitness',
  weight_loss: 'Lose Weight',
  weight_gain: 'Gain Weight',
  muscle_gain: 'Build Muscle',
  maintenance: 'Maintenance',
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4">
      <span className="text-xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function ProfileView() {
  const { user } = useAuthContext()
  const { data: profile, isLoading } = useMyProfile()
  const { data: goal } = useActiveGoal()

  if (isLoading || !user) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center gap-4 pt-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    )
  }

  if (!profile || !user) return null

  const username = user.username
  const followerCount = (profile as any).follower_count ?? 0
  const followingCount = (profile as any).following_count ?? 0

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

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {profile.is_public
            ? <><Globe className="h-3 w-3" /> Public profile</>
            : <><Lock className="h-3 w-3" /> Private profile</>}
        </div>

        <Link href="/profile/edit">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Social stats */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-around divide-x">
            <StatBox label="Followers" value={followerCount} />
            <StatBox label="Following" value={followingCount} />
          </div>
        </CardContent>
      </Card>

      {/* Personal details */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            About
          </p>
          {profile.age == null && !profile.gender && profile.height_cm == null ? (
            <p className="text-sm text-muted-foreground">
              No details added.{' '}
              <Link href="/profile/edit" className="text-primary underline underline-offset-2">
                Complete your profile
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {profile.age != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{profile.age} yrs</span>
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground text-xs">Gender</span>
                  <span>{GENDER_LABELS[profile.gender] ?? profile.gender}</span>
                </div>
              )}
              {profile.height_cm != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{profile.height_cm} cm</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active goal */}
      {goal && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active Goal
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {GOAL_LABELS[goal.goal_type] ?? goal.goal_type}
                </span>
              </div>
              {goal.target_weight_kg != null && (
                <Badge variant="secondary">Target: {goal.target_weight_kg} kg</Badge>
              )}
            </div>
            {goal.target_date && (
              <p className="text-xs text-muted-foreground">
                By {new Date(goal.target_date).toLocaleDateString(undefined, {
                  month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
