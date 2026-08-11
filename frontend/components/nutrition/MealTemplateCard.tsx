'use client'

import { MoreVertical, Trash2, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteMealTemplate } from '@/hooks/useMealTemplates'
import type { MealTemplate } from '@/types/meal-template'

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

interface MealTemplateCardProps {
  template: MealTemplate
  onApply?: (template: MealTemplate) => void
  isApplying?: boolean
}

export function MealTemplateCard({ template, onApply, isApplying }: MealTemplateCardProps) {
  const deleteTemplate = useDeleteMealTemplate()
  const preview = template.items.map((i) => i.food_name).join(', ')

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
          <Utensils className="h-3 w-3" />
          <span>{MEAL_TYPE_LABELS[template.meal_type] ?? template.meal_type}</span>
          <span>·</span>
          <span>
            {template.item_count} item{template.item_count !== 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span className="tabular-nums">{Math.round(template.total_calories)} kcal</span>
        </div>
        {preview && (
          <p className="text-xs text-muted-foreground truncate">{preview}</p>
        )}
      </CardHeader>
      {onApply && (
        <CardContent className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onApply(template)}
            disabled={isApplying}
          >
            Apply Template
          </Button>
        </CardContent>
      )}
    </Card>
  )
}
