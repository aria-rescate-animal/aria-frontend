import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Bell, Info, AlertTriangle, CheckCircle2, BellOff, Settings, LogOut, ChevronDown, Menu } from 'lucide-react'
import { getNotificaciones, contarNoLeidas, marcarLeida, marcarTodasLeidas } from '@/services/notificaciones.service'

function getNotifStyle(titulo = '') {
  const t = titulo.toLowerCase()
  if (t.includes('rescatado') || t.includes('aprobada') || t.includes('reactivada'))
    return { Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' }
  if (t.includes('urgente') || t.includes('nuevo') || t.includes('necesita') || t.includes('suspendida'))
    return { Icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-500' }
  return { Icon: Info, color: 'text-teal', bg: 'bg-teal/10', dot: 'bg-teal' }
}

function formatFecha(fecha) {
  if (!fecha) return ''
  const diff = Math.floor((Date.now() - new Date(fecha)) / 60000)
  if (diff < 1)    return 'Ahora mismo'
  if (diff < 60)   return `Hace ${diff} min`
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [panel, setPanel]       = useState(null)
  const topbarRef               = useRef(null)
  const [notifs, setNotifs]     = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [cargando, setCargando] = useState(false)

  const initials = (user?.nombre || 'U').substring(0, 2).toUpperCase()
  const displayName = (user?.nombre || 'Usuario').trim().split(/\s+/)[0]

  useEffect(() => {
    const fn = e => { if (topbarRef.current && !topbarRef.current.contains(e.target)) setPanel(null) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => {
    const load = async () => { try { setNoLeidas(await contarNoLeidas()) } catch (err) { console.error('Error al contar notificaciones:', err) } }
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  const togglePanel = useCallback(async (nombre) => {
    const next = panel === nombre ? null : nombre
    setPanel(next)
    if (next === 'notif') {
      setCargando(true)
      try { setNotifs(await getNotificaciones()) } catch (err) { console.error('Error al cargar notificaciones:', err); setNotifs([]) }
      finally { setCargando(false) }
    }
  }, [panel])

  const marcarLeida_ = async (id) => {
    try {
      await marcarLeida(id)
      setNotifs(p => p.map(n => n.id === id ? { ...n, leida: 1 } : n))
      setNoLeidas(p => Math.max(0, p - 1))
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err)
    }
  }

  const marcarTodas = async () => {
    try {
      await marcarTodasLeidas()
      setNotifs(p => p.map(n => ({ ...n, leida: 1 })))
      setNoLeidas(0)
    } catch (err) {
      console.error('Error al marcar todas las notificaciones:', err)
    }
  }

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-card px-3 md:px-6">
      <button onClick={onMenuClick}
        className="mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors md:hidden">
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex flex-1 min-w-0 items-center md:hidden">
        <span className="text-sm font-bold text-foreground">ARIA</span>
      </div>

      <div ref={topbarRef} className="flex items-center gap-2 ml-auto">
        <div className="relative">
          <button onClick={() => togglePanel('notif')} aria-label="Notificaciones"
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              panel === 'notif' ? 'border-teal bg-teal/10 text-teal' : 'border-border bg-card text-muted-foreground hover:border-teal/50 hover:bg-teal/5 hover:text-teal'
            }`}>
            <Bell className="h-4 w-4" />
            {noLeidas > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-card">
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            )}
          </button>

          {panel === 'notif' && (
            <div className="absolute right-0 top-full mt-2 w-[min(320px,calc(100vw-1rem))] rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Notificaciones</span>
                  {noLeidas > 0 && <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-bold text-teal">{noLeidas} nueva{noLeidas > 1 ? 's' : ''}</span>}
                </div>
                {noLeidas > 0 && <button onClick={marcarTodas} className="text-xs font-semibold text-teal hover:underline">Marcar todas</button>}
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {cargando ? (
                  [1,2,3].map(i => (
                    <div key={i} className="flex gap-3 border-b border-border p-4 animate-pulse">
                      <div className="h-9 w-9 rounded-xl bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-2"><div className="h-3 rounded bg-muted w-3/4" /><div className="h-2.5 rounded bg-muted w-full" /></div>
                    </div>
                  ))
                ) : notifs.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"><BellOff className="h-5 w-5" /></div>
                    <span className="text-sm">Sin notificaciones</span>
                  </div>
                ) : (
                  notifs.map(n => {
                    const { Icon, color, bg, dot } = getNotifStyle(n.titulo)
                    const noLeida = !n.leida
                    return (
                      <div key={n.id} onClick={() => noLeida && marcarLeida_(n.id)}
                        className={`flex cursor-pointer items-start gap-3 border-b border-border p-4 transition-colors last:border-0 ${noLeida ? 'bg-teal/5 hover:bg-teal/10' : 'hover:bg-muted/40'}`}>
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}><Icon className={`h-4 w-4 ${color}`} /></div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm leading-snug truncate ${noLeida ? 'font-bold text-foreground' : 'font-medium text-foreground'}`} title={n.titulo}>{n.titulo}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.mensaje}</p>
                          <span className="mt-1 block text-xs text-muted-foreground/70">{formatFecha(n.fecha)}</span>
                        </div>
                        {noLeida && <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${dot}`} />}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative hidden md:block">
          <button onClick={() => togglePanel('perfil')}
            className={`flex h-10 min-w-[118px] max-w-[164px] items-center gap-2 rounded-xl border px-2.5 transition-colors ${
              panel === 'perfil' ? 'border-teal/50 bg-teal/5' : 'border-border bg-card hover:bg-muted'
            }`}>
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy text-white text-xs font-bold">
              {initials}
            </div>
            <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground" title={user?.nombre}>
              {displayName}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform ${panel === 'perfil' ? 'rotate-180' : ''}`} />
          </button>

          {panel === 'perfil' && (
            <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1rem)] rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
              <div className="border-b border-border bg-muted/30 px-4 py-3">
                <p className="truncate text-sm font-semibold text-foreground" title={user?.nombre}>{user?.nombre}</p>
                <p className="truncate text-xs text-muted-foreground" title={user?.email}>{user?.email}</p>
              </div>
              <div className="p-1">
                <Link to="/perfil" onClick={() => setPanel(null)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <Settings className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">Mi Perfil</span>
                </Link>
                <button onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
