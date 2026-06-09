'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Dumbbell, MessageCircle, Scale, Utensils } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Badge } from '@/components/ui/badge'
import { KudosButton } from '@/components/community/KudosButton'
import { CommentSection } from '@/components/community/CommentSection'
import { formatRelative, formatWeight, formatWeightDelta, formatCalories, formatMacro } from '@/lib/utils/format'
import type { FeedItem as FeedItemType } from '@/types/feed'

interface FeedItemProps {
  item: FeedItemType
}

const ACTIVITY_ICONS = {
  workout: Dumbbell,
  meal: Utensils,
  weight: Scale,
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export function FeedItem({ item }: FeedItemProps) {
  const [showComments, setShowComments] = useState(false)
  const Icon = ACTIVITY_ICONS[item.activity_type]

  return (
    <article className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <Link href={`/u/${item.user.username}`} className="shrink-0">
            <Avatar name={item.user.full_name} username={item.user.username} size="sm" />
          </Link>
          <div>
            <Link
              href={`/u/${item.user.username}`}
              className="font-semibold leading-tight hover:underline"
            >
              {item.user.full_name}
            </Link>
            <p className="text-xs text-muted-foreground">
              @{item.user.username} · {formatRelative(item.created_at)}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Content */}
      <div className="border-t px-4 py-3">
        {item.activity_type === 'workout' && item.workout && (
          <WorkoutContent workout={item.workout} />
        )}
        {item.activity_type === 'meal' && item.meal && (
          <MealContent meal={item.meal} />
        )}
        {item.activity_type === 'weight' && item.weight && (
          <WeightContent weight={item.weight} />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t px-3 py-2">
        <KudosButton
          feedItemId={item.id}
          kudosCount={item.kudos_count}
          hasKudos={item.has_kudos}
        />
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle comments"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{item.comment_count}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentSection feedItemId={item.id} />}
    </article>
  )
}

// ── Sub-renderers ──────────────────────────────────────────────────────────────

function WorkoutContent({ workout }: { workout: NonNullable<FeedItemType['workout']> }) {
  return (
    <div className="space-y-2">
      {workout.name && (
        <p className="font-semibold">{workout.name}</p>
      )}
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>{workout.exercise_count} exercises</span>
        <span>·</span>
        <span>{workout.total_sets} sets</span>
        {workout.total_volume_kg > 0 && (
          <>
            <span>·</span>
            <span>{formatWeight(workout.total_volume_kg)} volume</span>
          </>
        )}
      </div>
      {workout.exercises.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {workout.exercises.slice(0, 4).map((name) => (
            <Badge key={name} variant="secondary" className="text-xs font-normal">
              {name}
            </Badge>
          ))}
          {workout.exercises.length > 4 && (
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              +{workout.exercises.length - 4} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

function MealContent({ meal }: { meal: NonNullable<FeedItemType['meal']> }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <p className="font-semibold">{meal.food_name}</p>
        <Badge variant="secondary" className="text-xs font-normal">
          {MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>{formatCalories(meal.calories)}</span>
        {meal.protein_g !== null && <span>{formatMacro(meal.protein_g)} protein</span>}
        {meal.carbs_g !== null && <span>{formatMacro(meal.carbs_g)} carbs</span>}
        {meal.fat_g !== null && <span>{formatMacro(meal.fat_g)} fat</span>}
      </div>
    </div>
  )
}

function WeightContent({ weight }: { weight: NonNullable<FeedItemType['weight']> }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-2xl font-bold">{formatWeight(weight.weight_kg)}</span>
      {weight.delta_kg !== null && (
        <span
          className={
            weight.delta_kg < 0
              ? 'text-sm font-medium text-emerald-600 dark:text-emerald-400'
              : weight.delta_kg > 0
                ? 'text-sm font-medium text-rose-500'
                : 'text-sm text-muted-foreground'
          }
        >
          {formatWeightDelta(weight.delta_kg)}
        </span>
      )}
    </div>
  )
}
