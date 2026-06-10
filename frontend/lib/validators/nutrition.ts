import { z } from 'zod'

export const nutritionFormSchema = z.object({
  entry_date: z.string().min(1, 'Date is required'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
    errorMap: () => ({ message: 'Select a meal type' }),
  }),
  food_name: z.string().min(1, 'Food name is required').max(200),
  calories: z
    .number({ invalid_type_error: 'Enter calories' })
    .min(0, 'Min 0')
    .max(10000, 'Max 10,000'),
  protein_g: z.number().min(0).max(1000).nullable().optional(),
  carbs_g: z.number().min(0).max(1000).nullable().optional(),
  fat_g: z.number().min(0).max(1000).nullable().optional(),
})

export type NutritionFormValues = z.infer<typeof nutritionFormSchema>
