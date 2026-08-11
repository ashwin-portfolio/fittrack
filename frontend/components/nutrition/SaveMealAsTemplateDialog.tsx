'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSaveMealAsTemplate } from '@/hooks/useMealTemplates'
import type { MealType } from '@/types/nutrition'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})
type FormValues = z.infer<typeof schema>

interface SaveMealAsTemplateDialogProps {
  entryDate: string
  mealType: MealType
  defaultName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveMealAsTemplateDialog({
  entryDate,
  mealType,
  defaultName = '',
  open,
  onOpenChange,
}: SaveMealAsTemplateDialogProps) {
  const saveAsTemplate = useSaveMealAsTemplate()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName },
    values: { name: defaultName },
  })

  function onSubmit(values: FormValues) {
    saveAsTemplate.mutate(
      { name: values.name, entry_date: entryDate, meal_type: mealType },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="meal-template-name">Template name</Label>
            <Input
              id="meal-template-name"
              placeholder="e.g. Protein Breakfast"
              {...form.register('name')}
              className={form.formState.errors.name ? 'border-destructive' : ''}
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={saveAsTemplate.isPending}>
            {saveAsTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
