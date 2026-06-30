'use client'

import { BookTemplate, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTemplates } from '@/hooks/useTemplates'
import { TemplateCard } from './TemplateCard'
import type { Template } from '@/types/template'

interface TemplatePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: Template) => void
}

export function TemplatePickerDialog({ open, onOpenChange, onSelect }: TemplatePickerDialogProps) {
  const { data, isLoading } = useTemplates()

  function handleSelect(template: Template) {
    onSelect(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Use a Template</DialogTitle>
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
                Save a workout as a template and it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {data.templates.map((template) => (
                <TemplateCard key={template.id} template={template} onUse={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
