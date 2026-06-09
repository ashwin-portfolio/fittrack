'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FoodSearchInput } from './FoodSearchInput'
import { nutritionFormSchema, type NutritionFormValues } from '@/lib/validators/nutrition'
import { useLogMeal, useRecentFoods } from '@/hooks/useNutrition'
import type { MealType, RecentFood } from '@/types/nutrition'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

interface NewNutritionViewProps {
  defaultDate: string
}

export function NewNutritionView({ defaultDate }: NewNutritionViewProps) {
  const router = useRouter()
  const logMeal = useLogMeal()
  const { data: recentFoods } = useRecentFoods()

  const form = useForm<NutritionFormValues>({
    resolver: zodResolver(nutritionFormSchema),
    defaultValues: {
      entry_date: defaultDate,
      meal_type: undefined,
      food_name: '',
      calories: '' as unknown as number,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
    },
  })

  function applyRecentFood(food: RecentFood) {
    form.setValue('food_name', food.food_name, { shouldValidate: true })
    form.setValue('calories', food.calories, { shouldValidate: true })
    form.setValue('protein_g', food.protein_g ?? null)
    form.setValue('carbs_g', food.carbs_g ?? null)
    form.setValue('fat_g', food.fat_g ?? null)
    if (food.meal_type) {
      form.setValue('meal_type', food.meal_type as MealType)
    }
  }

  function onSubmit(values: NutritionFormValues) {
    logMeal.mutate(
      {
        entry_date: values.entry_date,
        meal_type: values.meal_type,
        food_name: values.food_name,
        calories: values.calories,
        protein_g: values.protein_g ?? undefined,
        carbs_g: values.carbs_g ?? undefined,
        fat_g: values.fat_g ?? undefined,
      },
      {
        onSuccess: () => router.push(`/nutrition`),
      }
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight">Log Meal</h1>

      {/* Recent foods */}
      {recentFoods && recentFoods.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recent
          </p>
          <div className="flex flex-wrap gap-2">
            {recentFoods.map((food, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyRecentFood(food)}
                className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors text-left"
              >
                <span className="font-medium">{food.food_name}</span>
                <span className="text-muted-foreground ml-1">· {Math.round(food.calories)} kcal</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Date */}
          <FormField
            control={form.control}
            name="entry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Meal type */}
          <FormField
            control={form.control}
            name="meal_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MEAL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Food name with search */}
          <FormField
            control={form.control}
            name="food_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food</FormLabel>
                <FormControl>
                  <FoodSearchInput
                    value={field.value}
                    onChange={field.onChange}
                    error={Boolean(form.formState.errors.food_name)}
                    onSelect={(result) => {
                      form.setValue('food_name', result.food_name, { shouldValidate: true })
                      form.setValue('calories', result.calories, { shouldValidate: true })
                      form.setValue('protein_g', result.protein_g)
                      form.setValue('carbs_g', result.carbs_g)
                      form.setValue('fat_g', result.fat_g)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Calories */}
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories (kcal)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={10000}
                    placeholder="0"
                    {...field}
                    value={field.value === null || field.value === undefined || isNaN(field.value as number) ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? ('' as unknown as number) : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Macros row */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Macros (optional)
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(['protein_g', 'carbs_g', 'fat_g'] as const).map((key) => {
                  const labels = { protein_g: 'Protein (g)', carbs_g: 'Carbs (g)', fat_g: 'Fat (g)' }
                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={key}
                      render={({ field }) => (
                        <FormItem>
                          <Label className="text-xs">{labels[key]}</Label>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={1000}
                              step={0.1}
                              placeholder="—"
                              value={field.value == null || isNaN(field.value as number) ? '' : field.value}
                              onChange={(e) =>
                                field.onChange(e.target.value === '' ? null : Number(e.target.value))
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={logMeal.isPending}>
              {logMeal.isPending ? 'Saving…' : 'Log Meal'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
