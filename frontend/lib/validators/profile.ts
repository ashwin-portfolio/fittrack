import { z } from 'zod'

export const profileEditSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  age: z
    .number({ invalid_type_error: 'Enter a valid age' })
    .int()
    .min(13, 'Must be at least 13')
    .max(120)
    .nullable()
    .optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable().optional(),
  height_cm: z
    .number({ invalid_type_error: 'Enter a valid height' })
    .min(50, 'Min 50 cm')
    .max(300, 'Max 300 cm')
    .nullable()
    .optional(),
  is_public: z.boolean(),
})

export type ProfileEditValues = z.infer<typeof profileEditSchema>
