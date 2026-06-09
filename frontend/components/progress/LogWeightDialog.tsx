'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLogWeight } from '@/hooks/useWeight'
import {
  logWeightSchema,
  defaultLogWeightValues,
  type LogWeightFormValues,
} from '@/lib/validators/weight'

interface LogWeightDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogWeightDialog({ open, onOpenChange }: LogWeightDialogProps) {
  const logWeight = useLogWeight()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogWeightFormValues>({
    resolver: zodResolver(logWeightSchema),
    defaultValues: defaultLogWeightValues(),
  })

  function onSubmit(values: LogWeightFormValues) {
    logWeight.mutate(
      {
        weight_kg: values.weight_kg,
        body_fat_percentage:
          values.body_fat_percentage === '' || values.body_fat_percentage === undefined
            ? undefined
            : values.body_fat_percentage,
        notes: values.notes || undefined,
        logged_at: values.logged_at,
      },
      {
        onSuccess: () => {
          reset(defaultLogWeightValues())
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Log Weight</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="weight_kg">Weight (kg) *</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              placeholder="e.g. 75.5"
              {...register('weight_kg', { valueAsNumber: true })}
            />
            {errors.weight_kg && (
              <p className="text-xs text-destructive">{errors.weight_kg.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body_fat_percentage">Body Fat % (optional)</Label>
            <Input
              id="body_fat_percentage"
              type="number"
              step="0.1"
              placeholder="e.g. 18.5"
              {...register('body_fat_percentage', { valueAsNumber: true })}
            />
            {errors.body_fat_percentage && (
              <p className="text-xs text-destructive">
                {errors.body_fat_percentage.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="logged_at">Date</Label>
            <Input id="logged_at" type="date" {...register('logged_at')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any notes..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={logWeight.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={logWeight.isPending}>
              {logWeight.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
