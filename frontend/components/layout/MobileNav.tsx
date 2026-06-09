'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Home, Salad, TrendingUp, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', activePrefix: '/dashboard', label: 'Home',      icon: Home,       exact: true  },
  { href: '/workouts',  activePrefix: '/workouts',  label: 'Workouts',  icon: Dumbbell,   exact: false },
  { href: '/nutrition', activePrefix: '/nutrition', label: 'Nutrition', icon: Salad,      exact: false },
  { href: '/progress',  activePrefix: '/progress',  label: 'Progress',  icon: TrendingUp, exact: false },
  { href: '/community/feed', activePrefix: '/community', label: 'Community', icon: Users, exact: false },
  { href: '/profile',   activePrefix: '/profile',   label: 'Profile',   icon: User,       exact: false },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16 items-center">
        {NAV_ITEMS.map(({ href, activePrefix, label, icon: Icon, exact }) => {
          const active = exact ? pathname === activePrefix : pathname.startsWith(activePrefix)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon
                className={cn('h-5 w-5', active && 'stroke-[2.5]')}
                aria-hidden
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
