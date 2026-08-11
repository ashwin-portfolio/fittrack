'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSetWaterGoal, useWaterGoal } from '@/hooks/useWater'

interface SetWaterGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SetWaterGoalDialog({ open, onOpenChange }: SetWaterGoalDialogProps) {
  const { data: goal } = useWaterGoal()
  const { mutate, isPending } = useSetWaterGoal()

  const [value, setValue] = useState('')

  useEffect(() => {
    if (open) setValue(goal ? String(goal.daily_target_ml) : '2000')
  }, [open, goal])

  function handleSave() {
    const ml = parseInt(value, 10)
    if (!ml || ml < 100 || ml > 10000) return
    mutate(ml, { onSuccess: () => onOpenChange(false) })
  }

  const ml = parseInt(value, 10)
  const isValid = !Number.isNaN(ml) && ml >= 100 && ml <= 10000

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Daily Water Goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="water-goal-input">Target intake (ml/day)</Label>
            <Input
              id="water-goal-input"
              type="number"
              min={100}
              max={10000}
              placeholder="e.g. 2000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSave()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Used to track your daily water intake progress.
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
