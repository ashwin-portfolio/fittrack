import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    display_name: z.string().min(1, 'Display name is required').max(100, 'Maximum 100 characters'),
    username: z
      .string()
      .min(3, 'Minimum 3 characters')
      .max(20, 'Maximum 20 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Letters, numbers, hyphens, and underscores only'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Minimum 8 characters').max(128, 'Maximum 128 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const onboardingSchema = z.object({
  first_name: z.string().min(1, 'Required').max(50),
  last_name: z.string().min(1, 'Required').max(50),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  height_cm: z.coerce.number().min(50).max(300).optional(),
  weight_kg: z.coerce.number().min(20).max(500).optional(),
  fitness_goal: z
    .enum(['lose_weight', 'build_muscle', 'maintain_weight', 'improve_endurance', 'general_fitness'])
    .optional(),
  bio: z.string().max(500).optional(),
})

export const workoutSetSchema = z.object({
  reps: z.coerce.number().min(1, 'Required'),
  weight_kg: z.coerce.number().min(0).optional().nullable(),
  duration_seconds: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(200).optional().nullable(),
})

export const workoutExerciseSchema = z.object({
  exercise_id: z.string().min(1, 'Select an exercise'),
  order: z.number(),
  notes: z.string().max(200).optional().nullable(),
  sets: z.array(workoutSetSchema).min(1, 'At least one set required'),
})

export const workoutSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  notes: z.string().max(1000).optional(),
  duration_minutes: z.coerce.number().min(1).max(600).optional().nullable(),
  workout_date: z.string().min(1, 'Date is required'),
  is_shared: z.boolean().default(true),
  exercises: z.array(workoutExerciseSchema).min(1, 'Add at least one exercise'),
})

export const nutritionSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  food_name: z.string().min(1, 'Food name is required').max(200),
  quantity: z.coerce.number().min(0.1, 'Required'),
  unit: z.string().min(1, 'Unit is required').max(50),
  calories: z.coerce.number().min(0, 'Required'),
  protein_g: z.coerce.number().min(0).optional().nullable(),
  carbs_g: z.coerce.number().min(0).optional().nullable(),
  fat_g: z.coerce.number().min(0).optional().nullable(),
  fiber_g: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(500).optional(),
  is_shared: z.boolean().default(true),
})

export const weightEntrySchema = z.object({
  weight_kg: z.coerce.number().min(20, 'Must be at least 20 kg').max(500),
  body_fat_percentage: z.coerce.number().min(1).max(70).optional().nullable(),
  notes: z.string().max(500).optional(),
  logged_at: z.string().optional(),
})

export const goalSchema = z.object({
  goal_type: z.enum([
    'lose_weight',
    'build_muscle',
    'maintain_weight',
    'improve_endurance',
    'general_fitness',
  ]),
  target_weight_kg: z.coerce.number().min(20).max(500).optional().nullable(),
  target_date: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
})

export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  muscle_group: z.enum([
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'core', 'quadriceps', 'hamstrings', 'glutes', 'calves',
    'full_body', 'cardio', 'other',
  ]),
  category: z.enum(['strength', 'cardio', 'flexibility', 'other']),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type OnboardingFormValues = z.infer<typeof onboardingSchema>
export type WorkoutFormValues = z.infer<typeof workoutSchema>
export type NutritionFormValues = z.infer<typeof nutritionSchema>
export type WeightEntryFormValues = z.infer<typeof weightEntrySchema>
export type GoalFormValues = z.infer<typeof goalSchema>
export type CommentFormValues = z.infer<typeof commentSchema>
export type CreateExerciseFormValues = z.infer<typeof createExerciseSchema>
