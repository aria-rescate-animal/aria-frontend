import { useState, useEffect } from 'react'
import { ReportCard } from '@/components/ReportCard'
import { obtenerMisReportes } from '@/services/reportes.service'
import { ChevronLeft, ChevronRight, Eye, X } from 'lucide-react'
import { CATEGORIA_LABELS, ESTADO_LABELS, PRIORIDAD_LABELS } from '@/lib/estados'

export default function MisReportes() {
  const [reportes, setReportes] = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState(null)
  const LIMIT = 9

  useEffect(() => {
    setLoading(true)
    setError('')
    obtenerMisReportes(page, LIMIT)
      .then(d => { setReportes(d.reportes || []); setTotal(d.total || 0) })
      .catch(err => setError(err.response?.data?.error || err.response?.data?.message || 'No se pudieron cargar tus reportes.'))
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mis Reportes</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} reportes en total.</p>
      </header>

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
                  <Eye className="h-3.5 w-3.5" /> Ver seguimiento
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

      {selected && <SeguimientoModal reporte={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function SeguimientoModal({ reporte, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Seguimiento del reporte</h3>
            <p className="text-xs text-muted-foreground">{reporte.especie}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        {reporte.foto && <img src={reporte.foto} alt={reporte.especie} className="mb-4 h-48 w-full rounded-lg object-cover" />}
        <div className="space-y-3">
          <Info label="Estado" value={ESTADO_LABELS[reporte.estado] || reporte.estado} />
          <Info label="Categoría" value={CATEGORIA_LABELS[reporte.categoria] || reporte.categoria} />
          <Info label="Prioridad" value={PRIORIDAD_LABELS[reporte.prioridad || 'normal'] || reporte.prioridad} />
          <Info label="Entidad" value={reporte.entidad_nombre || 'Sin entidad asignada'} />
          <Info label="Descripción" value={reporte.descripcion} />
          <Info label="Nota de la entidad" value={reporte.nota_entidad} />
          <Info label="Fecha" value={reporte.fecha ? new Date(reporte.fecha).toLocaleString('es-CO') : ''} />
          {reporte.estado !== 'rescatado' && <Info label="Ubicación" value={reporte.ubicacion} />}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  if (!value) return null
  return <div><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-0.5 break-words text-sm text-foreground">{value}</p></div>
}
