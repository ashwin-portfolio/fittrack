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
import { Textarea } from '@/components/ui/textarea'
import { useSaveAsTemplate } from '@/hooks/useTemplates'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  notes: z.string().max(500).optional(),
})
type FormValues = z.infer<typeof schema>

interface SaveAsTemplateDialogProps {
  workoutId: string
  defaultName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveAsTemplateDialog({
  workoutId,
  defaultName = '',
  open,
  onOpenChange,
}: SaveAsTemplateDialogProps) {
  const saveAsTemplate = useSaveAsTemplate()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, notes: '' },
  })

  function onSubmit(values: FormValues) {
    saveAsTemplate.mutate(
      { workoutId, data: { name: values.name, notes: values.notes || null } },
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
            <Label htmlFor="template-name">Template name</Label>
            <Input
              id="template-name"
              placeholder="e.g. Push Day A"
              {...form.register('name')}
              className={form.formState.errors.name ? 'border-destructive' : ''}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="template-notes">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="template-notes"
              placeholder="Any notes for this template..."
              rows={2}
              {...form.register('notes')}
            />
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
