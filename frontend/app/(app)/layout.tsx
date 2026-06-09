import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Topbar } from '@/components/layout/Topbar'
import { AuthGuard } from '@/components/layout/AuthGuard'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 pb-[calc(4rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </AuthGuard>
  )
}
