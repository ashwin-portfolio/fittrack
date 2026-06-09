'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useToggleKudos } from '@/hooks/useSocial'

interface KudosButtonProps {
  feedItemId: string
  kudosCount: number
  hasKudos: boolean
}

export function KudosButton({ feedItemId, kudosCount, hasKudos }: KudosButtonProps) {
  const { mutate, isPending } = useToggleKudos()

  return (
    <button
      onClick={() => mutate({ feedItemId, hasKudos })}
      disabled={isPending}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
        hasKudos
          ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      aria-label={hasKudos ? 'Remove kudos' : 'Give kudos'}
    >
      <Heart
        className={cn('h-4 w-4 transition-all', hasKudos && 'fill-rose-500')}
      />
      <span>{kudosCount}</span>
    </button>
  )
}
