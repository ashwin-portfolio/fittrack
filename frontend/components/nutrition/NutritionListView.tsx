'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { NutritionDaySummary } from './NutritionDaySummary'
import { MealSection } from './MealSection'
import { useNutritionEntries, useDailySummary } from '@/hooks/useNutrition'
import type { MealType, NutritionEntry } from '@/types/nutrition'

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

function dateToLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return dateToLocal(d)
}

function formatDateLabel(dateStr: string): string {
  const today = dateToLocal(new Date())
  const yesterday = addDays(today, -1)
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function NutritionListView() {
  const today = dateToLocal(new Date())
  const [date, setDate] = useState(today)

  const isToday = date === today

  const { data: entriesData, isLoading: loadingEntries } = useNutritionEntries(date)
  const { data: summary, isLoading: loadingSummary } = useDailySummary(date)

  const entries: NutritionEntry[] = entriesData?.items ?? []

  const entriesByMeal: Record<MealType, NutritionEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  }
  entries.forEach((e) => {
    entriesByMeal[e.meal_type]?.push(e)
  })

  const hasSomethingToday = entries.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
        <Link href={`/nutrition/new?date=${date}`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Log Meal
          </Button>
        </Link>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDate(addDays(date, -1))}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatDateLabel(date)}</span>
          {!isToday && (
            <button
              onClick={() => setDate(today)}
              className="text-xs text-primary underline underline-offset-2 hover:no-underline"
            >
              Back to today
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setDate(addDays(date, 1))}
          disabled={isToday}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Daily summary */}
      <NutritionDaySummary summary={summary} isLoading={loadingSummary} />

      {/* Meal sections */}
      {loadingEntries ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : hasSomethingToday ? (
        <div className="space-y-6">
          {MEAL_ORDER.map((mealType) =>
            entriesByMeal[mealType].length > 0 ? (
              <MealSection
                key={mealType}
                mealType={mealType}
                entries={entriesByMeal[mealType]}
                date={date}
              />
            ) : null
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">No meals logged for this day.</p>
          <Link href={`/nutrition/new?date=${date}`} className="mt-3">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Log your first meal
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
