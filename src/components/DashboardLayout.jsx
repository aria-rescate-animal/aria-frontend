import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, MobileBottomNav, MobileDrawer } from './Sidebar'
import { Topbar } from './Topbar'

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setDrawerOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}
