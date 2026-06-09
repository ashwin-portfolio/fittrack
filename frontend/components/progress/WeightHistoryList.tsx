'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useWeightHistory, useDeleteWeightEntry } from '@/hooks/useWeight'
import { formatDate } from '@/lib/utils/format'
import type { WeightEntry } from '@/types/weight'

interface EntryRowProps {
  entry: WeightEntry
  onDelete: (id: string) => void
  isDeleting: boolean
}

function EntryRow({ entry, onDelete, isDeleting }: EntryRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between py-3 border-b last:border-0">
        <div>
          <p className="font-medium tabular-nums">{entry.weight_kg.toFixed(1)} kg</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(entry.log_date)}
            {entry.delta_kg != null && (
              <span className={entry.delta_kg < 0 ? 'text-emerald-500' : entry.delta_kg > 0 ? 'text-rose-500' : ''}>
                {' '}· {entry.delta_kg > 0 ? '+' : ''}{entry.delta_kg.toFixed(1)} kg
              </span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete entry"
        description="Remove this weight entry? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          onDelete(entry.id)
          setConfirmOpen(false)
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

export function WeightHistoryList() {
  const { data, isLoading } = useWeightHistory({ days: 365 })
  const deleteEntry = useDeleteWeightEntry()

  const entries = [...(data?.items ?? [])].sort(
    (a, b) => b.log_date.localeCompare(a.log_date),
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Recent entries
          {entries.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({entries.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !entries.length ? (
          <EmptyState
            title="No entries yet"
            description="Log your weight to start tracking."
            className="py-10"
          />
        ) : (
          <div>
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onDelete={(id) => deleteEntry.mutate(id)}
                isDeleting={deleteEntry.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
