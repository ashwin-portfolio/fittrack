'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Dumbbell,
  Home,
  LogOut,
  Salad,
  TrendingUp,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthContext } from '@/lib/auth/context'
import { Avatar } from '@/components/shared/Avatar'

const NAV_ITEMS = [
  { href: '/dashboard',      label: 'Dashboard',  icon: Home,      exact: true },
  { href: '/workouts',       label: 'Workouts',   icon: Dumbbell,  exact: false },
  { href: '/nutrition',      label: 'Nutrition',  icon: Salad,     exact: false },
  { href: '/progress',       label: 'Progress',   icon: TrendingUp, exact: false },
  { href: '/community',      label: 'Community',  icon: Users,     exact: false },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile, logout } = useAuthContext()

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold tracking-tight text-primary">FitTrack</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className={cn(
              'flex items-center gap-3 min-w-0 flex-1 rounded-md px-1 py-1 transition-colors',
              pathname.startsWith('/profile')
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent',
            )}
          >
            <Avatar
              name={profile?.full_name ?? null}
              username={profile?.username ?? ''}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {profile?.full_name ?? user?.username ?? ''}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{profile?.username ?? user?.username ?? ''}
              </p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
