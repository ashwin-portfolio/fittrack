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
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/nutrition', label: 'Nutrition', icon: Salad },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/community/feed', label: 'Community', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, logout } = useAuthContext()

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-xl font-bold tracking-tight text-primary">FitTrack</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
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
          <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1 rounded-md hover:bg-accent px-1 py-1 transition-colors">
            <Avatar
              name={profile?.full_name ?? null}
              username={profile?.username ?? ''}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {profile?.full_name ?? profile?.username ?? ''}
              </p>
              <p className="truncate text-xs text-muted-foreground">@{profile?.username}</p>
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
