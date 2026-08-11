'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useFollow, useFollowers, useFollowing } from '@/hooks/useSocial'
import { queryKeys } from '@/lib/query/keys'
import type { FollowListItem } from '@/types/social'

interface FollowUserRowProps {
  item: FollowListItem
  profileUsername: string
  currentUsername?: string
  onClose: () => void
}

function FollowUserRow({ item, profileUsername, currentUsername, onClose }: FollowUserRowProps) {
  const queryClient = useQueryClient()
  const follow = useFollow(item.username)
  const isSelf = item.username === currentUsername

  function handleToggle() {
    follow.mutate(item.is_following, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.social.followers(profileUsername) })
        queryClient.invalidateQueries({ queryKey: queryKeys.social.following(profileUsername) })
      },
    })
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <Link href={`/users/${item.username}`} onClick={onClose} className="shrink-0">
        <Avatar name={item.full_name} username={item.username} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/users/${item.username}`}
          onClick={onClose}
          className="hover:underline"
        >
          <p className="text-sm font-semibold leading-tight">{item.full_name}</p>
        </Link>
        <p className="text-xs text-muted-foreground">@{item.username}</p>
        {item.bio && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.bio}</p>
        )}
      </div>
      {!isSelf && (
        <Button
          size="sm"
          variant={item.is_following ? 'outline' : 'default'}
          disabled={follow.isPending}
          onClick={handleToggle}
          className="shrink-0"
        >
          {item.is_following ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  )
}

interface FollowListSheetProps {
  username: string
  type: 'followers' | 'following'
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUsername?: string
}

export function FollowListSheet({
  username,
  type,
  open,
  onOpenChange,
  currentUsername,
}: FollowListSheetProps) {
  const followersQuery = useFollowers(username, { enabled: open && type === 'followers' })
  const followingQuery = useFollowing(username, { enabled: open && type === 'following' })

  const query = type === 'followers' ? followersQuery : followingQuery
  const items = query.data?.items ?? []
  const title = type === 'followers' ? 'Followers' : 'Following'
  const emptyText = type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] flex flex-col px-0">
        <SheetHeader className="shrink-0 px-6 pb-2">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {query.isLoading ? (
            <div className="space-y-4 pt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">{emptyText}</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <FollowUserRow
                  key={item.username}
                  item={item}
                  profileUsername={username}
                  currentUsername={currentUsername}
                  onClose={() => onOpenChange(false)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
