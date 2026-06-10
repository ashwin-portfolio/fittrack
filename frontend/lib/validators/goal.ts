import { z } from 'zod'

export const GOAL_TYPE_OPTIONS = [
  { value: 'weight_loss',  label: 'Lose Weight'     },
  { value: 'weight_gain',  label: 'Gain Weight'     },
  { value: 'maintenance',  label: 'Maintain Weight' },
] as const

export const goalSchema = z
  .object({
    goal_type: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'maintenance'], {
      required_error: 'Select a goal type',
    }),
    target_weight_kg: z
      .number({ invalid_type_error: 'Enter a valid weight' })
      .min(20, 'Must be at least 20 kg')
      .max(500, 'Must be at most 500 kg')
      .nullable()
      .optional(),
  })
  .refine(
    (d) => d.goal_type === 'maintenance' || (d.target_weight_kg != null && d.target_weight_kg > 0),
    { message: 'Target weight is required', path: ['target_weight_kg'] },
  )

export type GoalFormValues = z.infer<typeof goalSchema>
