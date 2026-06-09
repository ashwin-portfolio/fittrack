'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useDeleteMeal } from '@/hooks/useNutrition'
import type { MealType, NutritionEntry } from '@/types/nutrition'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

interface MealSectionProps {
  mealType: MealType
  entries: NutritionEntry[]
  date: string
}

export function MealSection({ mealType, entries, date }: MealSectionProps) {
  const deleteMeal = useDeleteMeal(date)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  if (entries.length === 0) return null

  const total = entries.reduce((sum, e) => sum + e.calories, 0)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {MEAL_LABELS[mealType]}
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {Math.round(total)} kcal
        </span>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.food_name}</p>
                <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground tabular-nums">
                    {Math.round(entry.calories)} kcal
                  </span>
                  {entry.protein_g != null && (
                    <span>P: {Math.round(entry.protein_g)}g</span>
                  )}
                  {entry.carbs_g != null && (
                    <span>C: {Math.round(entry.carbs_g)}g</span>
                  )}
                  {entry.fat_g != null && (
                    <span>F: {Math.round(entry.fat_g)}g</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPendingDeleteId(entry.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                aria-label="Delete entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete entry?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        isPending={deleteMeal.isPending}
        onConfirm={() => {
          if (!pendingDeleteId) return
          deleteMeal.mutate(pendingDeleteId, {
            onSuccess: () => setPendingDeleteId(null),
          })
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}
