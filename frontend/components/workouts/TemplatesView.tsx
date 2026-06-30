'use client'

import Link from 'next/link'
import { ArrowLeft, BookTemplate, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTemplates } from '@/hooks/useTemplates'
import { TemplateCard } from './TemplateCard'

export function TemplatesView() {
  const { data, isLoading } = useTemplates()

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-2">
        <Link href="/workouts">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Workout Templates</h1>
          <p className="text-sm text-muted-foreground">Reuse your favourite workout structures</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.templates.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <BookTemplate className="h-12 w-12 text-muted-foreground opacity-40" />
          <div>
            <p className="font-medium">No templates yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open any workout and tap &quot;Save as Template&quot; to create one.
            </p>
          </div>
          <Link href="/workouts/new">
            <Button variant="outline" size="sm">
              Log a Workout
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}
