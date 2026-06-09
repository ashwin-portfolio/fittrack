'use client'

import { cn } from '@/lib/utils/cn'
import type { ActivityType } from '@/types/feed'

type FilterValue = ActivityType | undefined

interface FeedFilterProps {
  value: FilterValue
  onChange: (value: FilterValue) => void
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: undefined },
  { label: 'Workouts', value: 'workout' },
  { label: 'Nutrition', value: 'meal' },
  { label: 'Weight', value: 'weight' },
]

export function FeedFilter({ value, onChange }: FeedFilterProps) {
  return (
    <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          onClick={() => onChange(f.value)}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === f.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
