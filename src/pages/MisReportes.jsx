import { useState, useEffect } from 'react'
import { ReportCard } from '@/components/ReportCard'
import { ReporteDetalleModal } from '@/components/ReporteDetalleModal'
import { obtenerMisReportes } from '@/services/reportes.service'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'

const ESTADOS_FILTRO = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_atencion', label: 'En atención' },
  { value: 'rescatado', label: 'Rescatados' },
  { value: 'requiere_revision', label: 'En revisión' },
]

export default function MisReportes() {
  const [reportes, setReportes] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState(null)
  const [estado, setEstado]     = useState('')
  const LIMIT = 9

  useEffect(() => {
    setLoading(true)
    setError('')
    obtenerMisReportes(page, LIMIT, estado)
      .then(d => { setReportes(d.reportes || []); setTotal(d.total || 0) })
      .catch(err => setError(err.response?.data?.error || err.response?.data?.message || 'No se pudieron cargar tus reportes.'))
      .finally(() => setLoading(false))
  }, [page, estado])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal">Historial de reportes</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Mis reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta el seguimiento de los casos que has registrado.
          </p>
        </div>
        <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm">
          {total} en total
        </span>
      </header>

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Mostrar</span>
          {ESTADOS_FILTRO.map(filtro => {
            const active = estado === filtro.value
            return (
              <button
                key={filtro.value || 'todos'}
                type="button"
                onClick={() => { setEstado(filtro.value); setPage(1) }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {filtro.label}
              </button>
            )
          })}
        </div>
      </div>

      {error && <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : reportes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No tienes reportes aún.
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reportes.map(r => (
              <ReportCard key={r.id} report={r} actions={
                <button onClick={() => setSelected(r)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition">
                  <Eye className="h-3.5 w-3.5" /> Ver detalle
                </button>
              } />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>Página {page} de {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg border border-border bg-card p-1.5 hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="rounded-lg border border-border bg-card p-1.5 hover:bg-muted disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && <ReporteDetalleModal reporte={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
