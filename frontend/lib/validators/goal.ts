import { z } from 'zod'

export const GOAL_TYPE_OPTIONS = [
  { value: 'weight_loss',       label: 'Lose Weight'        },
  { value: 'weight_gain',       label: 'Gain Weight'        },
  { value: 'muscle_gain',       label: 'Build Muscle'       },
  { value: 'maintenance',       label: 'Maintain Weight'    },
  { value: 'workout_frequency', label: 'Workout Frequency'  },
] as const

const WEIGHT_GOAL_TYPES = ['weight_loss', 'weight_gain', 'muscle_gain'] as const

export const goalSchema = z
  .object({
    goal_type: z.enum(
      ['weight_loss', 'weight_gain', 'muscle_gain', 'maintenance', 'workout_frequency'],
      { required_error: 'Select a goal type' },
    ),
    target_weight_kg: z
      .number({ invalid_type_error: 'Enter a valid weight' })
      .min(20, 'Must be at least 20 kg')
      .max(500, 'Must be at most 500 kg')
      .nullable()
      .optional(),
    target_date: z.string().nullable().optional(),
    weekly_workout_target: z
      .number({ invalid_type_error: 'Enter a number' })
      .int()
      .min(1, 'At least 1 workout')
      .max(7, 'At most 7 workouts')
      .nullable()
      .optional(),
  })
  .refine(
    (d) =>
      (WEIGHT_GOAL_TYPES as readonly string[]).includes(d.goal_type)
        ? d.target_weight_kg != null && d.target_weight_kg > 0
        : true,
    { message: 'Target weight is required', path: ['target_weight_kg'] },
  )
  .refine(
    (d) =>
      d.goal_type === 'workout_frequency'
        ? d.weekly_workout_target != null && d.weekly_workout_target >= 1
        : true,
    { message: 'Target workouts per week is required', path: ['weekly_workout_target'] },
  )

export type GoalFormValues = z.infer<typeof goalSchema>
