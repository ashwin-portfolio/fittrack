'use client'

import { Dumbbell, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteTemplate } from '@/hooks/useTemplates'
import type { Template } from '@/types/template'

interface TemplateCardProps {
  template: Template
  onUse?: (template: Template) => void
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const deleteTemplate = useDeleteTemplate()
  const muscleGroups = Array.from(new Set(template.exercises.map((e) => e.muscle_group)))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{template.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-0.5">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteTemplate.mutate(template.id)}
                disabled={deleteTemplate.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Dumbbell className="h-3 w-3" />
          <span>
            {template.exercise_count} exercise{template.exercise_count !== 1 ? 's' : ''}
          </span>
          {muscleGroups.length > 0 && (
            <>
              <span>·</span>
              <span className="capitalize">{muscleGroups.join(', ')}</span>
            </>
          )}
        </div>
      </CardHeader>
      {onUse && (
        <CardContent className="pt-0">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onUse(template)}>
            Use Template
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
