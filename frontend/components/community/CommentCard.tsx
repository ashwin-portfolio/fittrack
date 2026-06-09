'use client'

import { Trash2 } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { formatRelative } from '@/lib/utils/format'
import { useDeleteComment } from '@/hooks/useSocial'
import type { Comment } from '@/types/social'

interface CommentCardProps {
  comment: Comment
  feedItemId: string
}

export function CommentCard({ comment, feedItemId }: CommentCardProps) {
  const { mutate: deleteComment, isPending } = useDeleteComment(feedItemId)

  return (
    <div className="flex gap-2.5">
      <Avatar
        name={comment.user.full_name}
        username={comment.user.username}
        size="xs"
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-sm font-medium">{comment.user.full_name}</span>
            <span className="ml-1.5 text-xs text-muted-foreground">
              @{comment.user.username}
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelative(comment.created_at)}
          </span>
        </div>
        <p className="mt-0.5 break-words text-sm text-foreground">{comment.content}</p>
      </div>
      {comment.is_own && (
        <button
          onClick={() => deleteComment(comment.id)}
          disabled={isPending}
          className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          aria-label="Delete comment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
