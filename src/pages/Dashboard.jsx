import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ReportCard } from '@/components/ReportCard'
import { ReporteDetalleModal } from '@/components/ReporteDetalleModal'
import { obtenerMisReportes, obtenerRescatadosPublicos } from '@/services/reportes.service'
import { useAuth } from '@/context/AuthContext'
import { Plus, ShieldCheck, FilePlus, Search, Eye } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [myReports, setMyReports] = useState([])
  const [rescued, setRescued]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [stats, setStats]         = useState({ total: 0, pendientes: 0, enAtencion: 0, rescatados: 0 })

  useEffect(() => {
    let active = true
    const misReportes = (estado = '', limit = 1) =>
      obtenerMisReportes(1, limit, estado).catch(() => ({ reportes: [], total: 0 }))

    Promise.all([
      misReportes('', 1),
      misReportes('pendiente', 6),
      misReportes('requiere_revision', 6),
      misReportes('en_atencion', 1),
      misReportes('rescatado', 1),
      obtenerRescatadosPublicos().catch(() => []),
    ])
      .then(([totalData, pendientesData, revisionData, atencionData, rescatadosData, rescuedData]) => {
        if (!active) return

        const reportesPorAtender = [
          ...(pendientesData.reportes || []),
          ...(revisionData.reportes || []),
        ]
          .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
          .slice(0, 6)

        setMyReports(reportesPorAtender)
        setStats({
          total: totalData.total || 0,
          pendientes: (pendientesData.total || 0) + (revisionData.total || 0),
          enAtencion: atencionData.total || 0,
          rescatados: rescatadosData.total || 0,
        })
        setRescued((rescuedData || []).slice(0, 3))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const nombre = user?.nombre?.split(' ')[0] || 'Usuario'
  const total  = stats.total

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal">Panel de reportes</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Actividad de reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? `${nombre}, tienes ${total} reporte${total > 1 ? 's' : ''} registrado${total > 1 ? 's' : ''}.`
              : `${nombre}, empieza registrando el primer caso que necesite atención.`}
          </p>
        </div>
        <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
          {total} en total
        </span>
      </header>

      {total > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total',       value: total,            color: 'text-navy' },
            { label: 'Por atender', value: stats.pendientes, color: 'text-red-600', help: 'pendientes o en revisión' },
            { label: 'En atención', value: stats.enAtencion, color: 'text-amber-600' },
            { label: 'Rescatados',  value: stats.rescatados, color: 'text-emerald-600' },
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
            <p className="text-sm font-semibold text-foreground leading-tight">Reportar caso</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Animal que necesita ayuda</p>
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
          <div>
            <h2 className="text-sm font-semibold text-foreground">Reportes por atender</h2>
            <p className="text-[11px] text-muted-foreground">Casos enviados que aún no han sido tomados por una entidad.</p>
          </div>
          <Link to="/mis-reportes" className="text-xs font-medium text-teal hover:underline">Ver historial →</Link>
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
            <p className="text-sm font-medium text-foreground">No tienes reportes pendientes de atención</p>
            <p className="mt-0.5 text-xs text-muted-foreground mb-3">Los casos tomados por una entidad están disponibles en el historial.</p>
            <Link to="/nuevo-reporte"
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition">
              <Plus className="h-3 w-3" /> Crear reporte
            </Link>
          </div>
        ) : (
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {myReports.map(r => (
              <ReportCard key={r.id} report={r} actions={
                <button onClick={() => setSelected(r)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted">
                  <Eye className="h-3.5 w-3.5" /> Ver detalle
                </button>
              } />
            ))}
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

      {selected && <ReporteDetalleModal reporte={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
