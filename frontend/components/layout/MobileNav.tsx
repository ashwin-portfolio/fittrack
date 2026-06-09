'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Home, Salad, TrendingUp, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home',      icon: Home       },
  { href: '/workouts',  label: 'Workouts',  icon: Dumbbell   },
  { href: '/nutrition', label: 'Nutrition', icon: Salad      },
  { href: '/progress',  label: 'Progress',  icon: TrendingUp },
  { href: '/community/feed', label: 'Community', icon: Users },
  { href: '/profile',   label: 'Profile',   icon: User       },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16 items-center">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === href
              : pathname.startsWith(href)
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
