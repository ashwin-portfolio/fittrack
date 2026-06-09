import { cn } from '@/lib/utils/cn'
import { getAvatarColor, getInitials } from '@/lib/utils/avatar'

interface AvatarProps {
  name: string | null    // full_name from profile
  username: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-24 w-24 text-3xl',
}

export function Avatar({ name, username, size = 'md', className }: AvatarProps) {
  const initials = getInitials(name, username)
  const colorClass = getAvatarColor(username)

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        SIZE_CLASSES[size],
        colorClass,
        className,
      )}
      aria-label={username}
    >
      {initials}
    </div>
  )
}
