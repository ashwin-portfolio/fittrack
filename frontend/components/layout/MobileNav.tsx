'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Home, Salad, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: Salad },
  { href: '/community/feed', label: 'Community', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden">
      <div className="flex h-16 items-center justify-around">
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
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
