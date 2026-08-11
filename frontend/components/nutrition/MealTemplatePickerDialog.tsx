'use client'

import { BookTemplate, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMealTemplates, useApplyMealTemplate } from '@/hooks/useMealTemplates'
import { MealTemplateCard } from './MealTemplateCard'
import type { MealTemplate } from '@/types/meal-template'

interface MealTemplatePickerDialogProps {
  date: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MealTemplatePickerDialog({ date, open, onOpenChange }: MealTemplatePickerDialogProps) {
  const { data, isLoading } = useMealTemplates()
  const applyTemplate = useApplyMealTemplate(date)

  function handleApply(template: MealTemplate) {
    applyTemplate.mutate(
      { id: template.id, data: { entry_date: date } },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Meal Templates</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.templates.length ? (
            <div className="text-center py-8 space-y-2">
              <BookTemplate className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">No templates yet</p>
              <p className="text-xs text-muted-foreground">
                Save a meal as a template and it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {data.templates.map((template) => (
                <MealTemplateCard
                  key={template.id}
                  template={template}
                  onApply={handleApply}
                  isApplying={applyTemplate.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
