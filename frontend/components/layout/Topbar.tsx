'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuthContext } from '@/lib/auth/context'
import { Avatar } from '@/components/shared/Avatar'

export function Topbar() {
  const { profile } = useAuthContext()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      {/* Page title is set per-page via metadata; topbar shows branding on mobile */}
      <span className="text-lg font-semibold md:hidden">FitTrack</span>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <Avatar
          name={profile?.full_name ?? null}
          username={profile?.username ?? ''}
          size="sm"
        />
      </div>
    </header>
  )
}
