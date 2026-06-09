'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/ui/button'
import { useFollow } from '@/hooks/useSocial'
import type { UserSearchItem } from '@/types/social'

interface UserCardProps {
  user: UserSearchItem
}

export function UserCard({ user }: UserCardProps) {
  const { mutate: toggleFollow, isPending } = useFollow(user.username)

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
      <Link href={`/u/${user.username}`} className="shrink-0">
        <Avatar name={user.full_name} username={user.username} size="md" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/u/${user.username}`} className="group">
          <p className="truncate font-semibold leading-tight group-hover:underline">
            {user.full_name}
          </p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </Link>

        {user.bio && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
        )}

        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{user.follower_count.toLocaleString()} followers</span>
        </div>
      </div>

      <Button
        size="sm"
        variant={user.is_following ? 'outline' : 'default'}
        disabled={isPending}
        onClick={() => toggleFollow(user.is_following)}
        className="shrink-0"
      >
        {user.is_following ? 'Following' : 'Follow'}
      </Button>
    </div>
  )
}
