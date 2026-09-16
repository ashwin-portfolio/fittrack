import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Rendered inline beside the title — e.g. a streak pill. */
  badge?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, badge, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
