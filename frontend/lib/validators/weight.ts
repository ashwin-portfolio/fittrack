import { z } from 'zod'
import { format } from 'date-fns'

export const logWeightSchema = z.object({
  weight_kg: z
    .number({ invalid_type_error: 'Enter a valid weight' })
    .min(20, 'Weight must be at least 20 kg')
    .max(500, 'Weight must be at most 500 kg'),
  log_date: z.string(),
  is_shared: z.boolean().optional(),
})

export type LogWeightFormValues = z.infer<typeof logWeightSchema>

export function defaultLogWeightValues(): LogWeightFormValues {
  return {
    weight_kg: '' as unknown as number,
    log_date: format(new Date(), 'yyyy-MM-dd'),
    is_shared: false,
  }
}
