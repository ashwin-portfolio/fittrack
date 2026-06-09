'use client'

import { Dumbbell, Flame, Scale, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { useAuthContext } from '@/lib/auth/context'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { WeightTrendChart } from '@/components/dashboard/WeightTrendChart'
import { WorkoutFrequencyChart } from '@/components/dashboard/WorkoutFrequencyChart'
import { CalorieChart } from '@/components/dashboard/CalorieChart'
import {
  useCaloriesChart,
  useDashboardSummary,
  useWeightChart,
  useWorkoutsChart,
} from '@/hooks/useDashboard'
import {
  formatCalories,
  formatMacro,
  formatWeight,
  formatWeightDelta,
} from '@/lib/utils/format'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export function DashboardView() {
  const { profile } = useAuthContext()
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: weightChart, isLoading: weightLoading } = useWeightChart(30)
  const { data: workoutsChart, isLoading: workoutsLoading } = useWorkoutsChart(8)
  const { data: caloriesChart, isLoading: caloriesLoading } = useCaloriesChart(7)

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? ''
  const subtitle = `Good ${getGreeting()}${firstName ? `, ${firstName}` : ''}`

  const weightDelta = summary?.weight_change_kg ?? null
  const weightDeltaClass =
    weightDelta === null
      ? undefined
      : weightDelta > 0
        ? 'text-rose-500'
        : weightDelta < 0
          ? 'text-emerald-500'
          : undefined

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <PageHeader title="Dashboard" subtitle={subtitle} />

      {/* Primary stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Weight"
          value={
            summary?.current_weight_kg != null
              ? formatWeight(summary.current_weight_kg)
              : null
          }
          subtitle="Most recent entry"
          icon={<Scale className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Target Weight"
          value={
            summary?.target_weight_kg != null
              ? formatWeight(summary.target_weight_kg)
              : null
          }
          subtitle="From goal settings"
          icon={<Target className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Weight Change"
          value={formatWeightDelta(weightDelta)}
          subtitle="vs. previous entry"
          icon={
            weightDelta !== null && weightDelta > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )
          }
          valueClassName={weightDeltaClass}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Workouts This Week"
          value={summary != null ? String(summary.workouts_this_week) : null}
          subtitle="Mon – Sun"
          icon={<Dumbbell className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
      </div>

      {/* Nutrition stats */}
      <div className="grid gap-3 grid-cols-2">
        <StatCard
          title="Calories Today"
          value={summary != null ? formatCalories(summary.calories_today) : null}
          subtitle="kcal logged"
          icon={<Flame className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
        <StatCard
          title="Protein Today"
          value={summary != null ? formatMacro(summary.protein_today_g) : null}
          subtitle="grams logged"
          icon={<Zap className="h-4 w-4" />}
          isLoading={summaryLoading}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <WeightTrendChart data={weightChart?.data} isLoading={weightLoading} />
        <WorkoutFrequencyChart data={workoutsChart?.data} isLoading={workoutsLoading} />
      </div>

      {/* Charts row 2 + activity feed */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <CalorieChart data={caloriesChart?.data} isLoading={caloriesLoading} />
        <RecentActivity
          activities={summary?.recent_activities}
          isLoading={summaryLoading}
        />
      </div>
    </div>
  )
}
