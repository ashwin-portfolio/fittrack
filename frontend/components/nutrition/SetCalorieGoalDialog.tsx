'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCalorieGoal, useSetCalorieGoal } from '@/hooks/useNutrition'

interface SetCalorieGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SetCalorieGoalDialog({ open, onOpenChange }: SetCalorieGoalDialogProps) {
  const { data: goal } = useCalorieGoal()
  const { mutate, isPending } = useSetCalorieGoal()

  const [value, setValue] = useState('')

  useEffect(() => {
    if (open) setValue(goal ? String(goal.daily_calories) : '')
  }, [open, goal])

  function handleSave() {
    const calories = parseInt(value, 10)
    if (!calories || calories < 1 || calories > 10000) return
    mutate(calories, { onSuccess: () => onOpenChange(false) })
  }

  const calories = parseInt(value, 10)
  const isValid = !Number.isNaN(calories) && calories >= 1 && calories <= 10000

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Daily Calorie Goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="calorie-goal-input">Target calories (kcal/day)</Label>
            <Input
              id="calorie-goal-input"
              type="number"
              min={1}
              max={10000}
              placeholder="e.g. 2000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSave()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Your nutrition page will show how many calories you have left each day.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid || isPending}>
              {isPending ? 'Saving…' : 'Save goal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
