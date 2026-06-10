import { z } from 'zod'

const setSchema = z.object({
  set_number: z.number().int().min(1),
  reps: z
    .number({ invalid_type_error: 'Enter reps' })
    .int('Must be a whole number')
    .min(1, 'Min 1')
    .max(999, 'Max 999'),
  weight_kg: z
    .number({ invalid_type_error: 'Enter weight' })
    .min(0, 'Min 0')
    .max(1000, 'Max 1000'),
})

const exerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  exercise_name: z.string(),
  muscle_group: z.string(),
  sets: z.array(setSchema).min(1, 'Add at least 1 set'),
})

export const workoutFormSchema = z.object({
  session_date: z.string().min(1, 'Date is required'),
  name: z.string().max(100, 'Max 100 characters').optional(),
  notes: z.string().optional(),
  exercises: z
    .array(exerciseSchema)
    .min(1, 'Add at least one exercise'),
})

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>
