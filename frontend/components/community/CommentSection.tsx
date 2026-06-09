'use client'

import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CommentCard } from '@/components/community/CommentCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAddComment, useComments } from '@/hooks/useSocial'
import { commentSchema, type CommentFormValues } from '@/lib/utils/validators'

interface CommentSectionProps {
  feedItemId: string
}

export function CommentSection({ feedItemId }: CommentSectionProps) {
  const { data, isLoading } = useComments(feedItemId)
  const { mutate: addComment, isPending } = useAddComment(feedItemId)

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  })

  function onSubmit(values: CommentFormValues) {
    addComment(values, {
      onSuccess: () => form.reset(),
    })
  }

  return (
    <div className="border-t px-4 py-3 space-y-3">
      {/* Comment list */}
      {isLoading ? (
        <div className="flex justify-center py-2">
          <LoadingSpinner />
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-3">
          {data.items.map((comment) => (
            <div key={comment.id} className="group">
              <CommentCard comment={comment} feedItemId={feedItemId} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      )}

      {/* Add comment */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <input
          {...form.register('content')}
          placeholder="Add a comment…"
          disabled={isPending}
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isPending || !form.watch('content').trim()}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </form>
    </div>
  )
}
