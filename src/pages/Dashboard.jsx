import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ReportCard } from '@/components/ReportCard'
import { obtenerMisReportes, obtenerRescatadosPublicos } from '@/services/reportes.service'
import { useAuth } from '@/context/AuthContext'
import { Plus, ShieldCheck, FilePlus, Search, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [myReports, setMyReports] = useState([])
  const [rescued, setRescued]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    setError('')
    Promise.all([
      obtenerMisReportes(1, 6)
        .then(d => setMyReports(d.reportes || []))
        .catch(() => {}),
      obtenerRescatadosPublicos()
        .then(data => setRescued((data || []).slice(0, 3)))
        .catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const nombre = user?.nombre?.split(' ')[0] || 'Usuario'
  const total  = myReports.length

  const urgentes = myReports.filter(r => r.prioridad === 'urgente').length
  const enAtencion = myReports.filter(r => r.estado === 'en_atencion').length
  const rescatados = myReports.filter(r => r.estado === 'rescatado').length

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground md:text-xl">Hola, {nombre}</h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            {total > 0 ? `${total} reporte${total > 1 ? 's' : ''} creado${total > 1 ? 's' : ''}` : 'Bienvenido a Aria'}
          </p>
        </div>
        <Link to="/nuevo-reporte"
          className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nuevo reporte</span>
          <span className="sm:hidden">Nuevo</span>
        </Link>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total',       value: total,       color: 'text-navy' },
            { label: 'Urgentes',    value: urgentes,    color: 'text-red-600',     help: 'prioridad urgente' },
            { label: 'En atención', value: enAtencion,  color: 'text-amber-600' },
            { label: 'Rescatados',  value: rescatados,  color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-card px-2 py-2.5 text-center md:px-4 md:py-3"
              title={s.help}>
              <p className={`text-xl font-black md:text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-medium text-muted-foreground leading-tight md:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <Link to="/nuevo-reporte"
          className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-3 hover:bg-muted transition-colors active:scale-[0.98]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 flex-shrink-0">
            <FilePlus className="h-4 w-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">Reportar</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Animal en peligro</p>
          </div>
        </Link>
        <Link to="/animales-perdidos"
          className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-3 hover:bg-muted transition-colors active:scale-[0.98]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 flex-shrink-0">
            <Search className="h-4 w-4 text-teal" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">Perdidas</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Buscar mascotas</p>
          </div>
        </Link>
      </div>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Mis reportes</h2>
          <Link to="/mis-reportes" className="text-xs font-medium text-teal hover:underline">Ver todos →</Link>
        </div>
        {loading ? (
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-lg border border-border bg-card animate-pulse flex gap-3 p-3 md:block">
                <div className="h-16 w-16 bg-muted rounded-lg flex-shrink-0 md:h-40 md:w-full md:rounded-t-lg md:rounded-b-none" />
                <div className="flex-1 space-y-2 py-1 md:p-3">
                  <div className="h-3.5 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : myReports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card py-8 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <FilePlus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Sin reportes aún</p>
            <p className="mt-0.5 text-xs text-muted-foreground mb-3">Crea tu primer reporte</p>
            <Link to="/nuevo-reporte"
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition">
              <Plus className="h-3 w-3" /> Crear reporte
            </Link>
          </div>
        ) : (
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {myReports.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        )}
      </section>

      {rescued.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <h2 className="text-sm font-semibold text-foreground">Rescatados recientemente</h2>
            <span className="ml-auto text-[11px] text-muted-foreground">Sin ubicación por privacidad</span>
          </div>
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rescued.map(r => <ReportCard key={r.id} report={r} hideLocation />)}
          </div>
        </section>
      )}
    </div>
  )
}
