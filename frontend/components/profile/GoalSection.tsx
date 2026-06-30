'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActiveGoal, useSetGoal } from '@/hooks/useGoals'
import { goalSchema, GOAL_TYPE_OPTIONS, type GoalFormValues } from '@/lib/validators/goal'

const WEIGHT_GOAL_TYPES = new Set(['weight_loss', 'weight_gain', 'muscle_gain'])

export function GoalSection() {
  const { data: goal, isLoading } = useActiveGoal()
  const setGoal = useSetGoal()

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goal_type: undefined,
      target_weight_kg: null,
      target_date: null,
      weekly_workout_target: null,
    },
  })

  const goalType = form.watch('goal_type')
  const isWeightGoal = WEIGHT_GOAL_TYPES.has(goalType)
  const isFrequency = goalType === 'workout_frequency'

  useEffect(() => {
    if (!goal) return
    form.reset({
      goal_type: goal.goal_type,
      target_weight_kg: goal.target_weight_kg ?? null,
      target_date: goal.target_date ?? null,
      weekly_workout_target: goal.weekly_workout_target ?? null,
    })
  }, [goal, form])

  function onSubmit(values: GoalFormValues) {
    setGoal.mutate({
      goal_type: values.goal_type,
      target_weight_kg: isWeightGoal ? (values.target_weight_kg ?? undefined) : undefined,
      target_date: isWeightGoal ? (values.target_date || null) : undefined,
      weekly_workout_target: isFrequency ? (values.weekly_workout_target ?? undefined) : undefined,
    })
  }

  if (isLoading) return null

  return (
    <Card>
      <CardContent className="pt-5 pb-5 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">
            {goal ? 'Update Goal' : 'Set a Goal'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Goal type */}
            <FormField
              control={form.control}
              name="goal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GOAL_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target weight (weight/muscle goals only) */}
            {isWeightGoal && (
              <FormField
                control={form.control}
                name="target_weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min={20}
                        max={500}
                        placeholder="e.g. 75.0"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? null : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Target date (optional, weight/muscle goals only) */}
            {isWeightGoal && (
              <FormField
                control={form.control}
                name="target_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Target Date{' '}
                      <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Weekly workout target (workout_frequency only) */}
            {isFrequency && (
              <FormField
                control={form.control}
                name="weekly_workout_target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workouts per Week</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={7}
                        placeholder="e.g. 4"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? null : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={setGoal.isPending}>
              {setGoal.isPending ? 'Saving…' : goal ? 'Update Goal' : 'Save Goal'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
