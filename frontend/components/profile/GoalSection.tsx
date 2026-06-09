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

export function GoalSection() {
  const { data: goal, isLoading } = useActiveGoal()
  const setGoal = useSetGoal()

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goal_type: undefined,
      target_weight_kg: null,
    },
  })

  const goalType = form.watch('goal_type')
  const isMaintenance = goalType === 'maintenance'

  useEffect(() => {
    if (!goal) return
    form.reset({
      goal_type: goal.goal_type,
      target_weight_kg: goal.target_weight_kg ?? null,
    })
  }, [goal, form])

  function onSubmit(values: GoalFormValues) {
    setGoal.mutate({
      goal_type: values.goal_type,
      target_weight_kg: isMaintenance ? undefined : (values.target_weight_kg ?? undefined),
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

            {!isMaintenance && (
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

            <Button
              type="submit"
              className="w-full"
              disabled={setGoal.isPending}
            >
              {setGoal.isPending ? 'Saving…' : goal ? 'Update Goal' : 'Save Goal'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
