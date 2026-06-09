'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { WeightStatsCards } from '@/components/progress/WeightStatsCards'
import { WeightHistoryChart } from '@/components/progress/WeightHistoryChart'
import { WeightHistoryList } from '@/components/progress/WeightHistoryList'
import { LogWeightDialog } from '@/components/progress/LogWeightDialog'
import { useWeightHistory } from '@/hooks/useWeight'

export function ProgressView() {
  const [logOpen, setLogOpen] = useState(false)
  const { data, isLoading } = useWeightHistory({ days: 365 })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress"
        subtitle="Track your weight over time"
        action={
          <Button onClick={() => setLogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Log weight
          </Button>
        }
      />

      <WeightStatsCards history={data} isLoading={isLoading} />
      <WeightHistoryChart />
      <WeightHistoryList />

      <LogWeightDialog open={logOpen} onOpenChange={setLogOpen} />
    </div>
  )
}
