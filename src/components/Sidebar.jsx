import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Home, FilePlus, Search, AlertTriangle,
  LayoutDashboard, Users, Building2, ShieldAlert,
  Siren, PawPrint, FileText, Send, X, LogOut
} from 'lucide-react'

const NAV = {
  ciudadano: [
    { to: '/dashboard',         label: 'Inicio',            icon: Home },
    { to: '/nuevo-reporte',     label: 'Nuevo Reporte',     icon: FilePlus },
    { to: '/mis-reportes',      label: 'Mis Reportes',      icon: FileText },
    { to: '/animales-perdidos', label: 'Mascotas Perdidas', icon: Search },
  ],
  entidad: [
    { to: '/reportes',          label: 'Casos Activos',     icon: Siren },
    { to: '/animales-perdidos', label: 'Mascotas Perdidas', icon: AlertTriangle },
  ],
  administrador: [
    { to: '/admin',                label: 'Dashboard',  icon: LayoutDashboard, section: 'dashboard' },
    { to: '/admin?s=usuarios',     label: 'Usuarios',   icon: Users,           section: 'usuarios' },
    { to: '/admin?s=entidades',    label: 'Entidades',  icon: Building2,       section: 'entidades' },
    { to: '/admin?s=moderacion',   label: 'Moderación', icon: ShieldAlert,     section: 'moderacion' },
    { to: '/admin?s=broadcast',    label: 'Mensajes',   icon: Send,            section: 'broadcast' },
  ],
}

const ROL_LABEL = {
  ciudadano:     'Panel ciudadano',
  entidad:       'Panel entidad',
  administrador: 'Panel administrador',
}

function useIsActive() {
  const { rol } = useAuth()
  const location = useLocation()
  return (item) => {
    if (rol === 'administrador') {
      const s = new URLSearchParams(location.search).get('s') || 'dashboard'
      return item.section === s
    }
    return location.pathname === item.to
  }
}

export function Sidebar() {
  const { user, rol } = useAuth()
  const homeTo = rol === 'entidad' ? '/reportes' : rol === 'administrador' ? '/admin' : '/dashboard'
  const items    = NAV[rol] ?? []
  const isActive = useIsActive()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <Link to={homeTo}
        className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5 hover:opacity-90 transition-opacity">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal flex-shrink-0">
          <PawPrint className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-white">Aria</span>
      </Link>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
          {ROL_LABEL[rol] || 'Panel'}
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <li key={item.label}>
                <Link to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal text-white'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                  }`}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/20 text-teal text-xs font-bold flex-shrink-0">
            {(user?.nombre || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.nombre}</p>
            <p className="text-[11px] text-sidebar-foreground/50 capitalize">{user?.rol}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function MobileBottomNav() {
  const { rol } = useAuth()
  const items    = NAV[rol] ?? []
  const isActive = useIsActive()

  const visible = items.slice(0, 4)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {visible.map((item) => {
        const active = isActive(item)
        const Icon = item.icon
        return (
          <Link key={item.label} to={item.to}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
              active ? 'text-teal' : 'text-muted-foreground'
            }`}>
            <div className={`flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
              active ? 'bg-teal/10' : ''
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="truncate max-w-[56px] text-center leading-tight">
              {item.label.split(' ')[0]}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileDrawer({ open, onClose }) {
  const { user, rol, logout } = useAuth()
  const navigate  = useNavigate()
  const items     = NAV[rol] ?? []
  const isActive  = useIsActive()

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-sidebar shadow-2xl md:hidden">
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal">
              <PawPrint className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">Aria</span>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            {ROL_LABEL[rol] || 'Panel'}
          </p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const active = isActive(item)
              const Icon = item.icon
              return (
                <li key={item.label}>
                  <Link to={item.to} onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-teal text-white'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                    }`}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/30 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-white text-xs font-bold flex-shrink-0">
              {(user?.nombre || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.nombre}</p>
              <p className="text-[11px] text-sidebar-foreground/50 capitalize">{user?.rol}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}
