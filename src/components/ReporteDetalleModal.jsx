import { X } from 'lucide-react'
import { CATEGORIA_LABELS, ESTADO_LABELS, PRIORIDAD_LABELS } from '@/lib/estados'

export function ReporteDetalleModal({ reporte, onClose }) {
  const estado = ESTADO_LABELS[reporte.estado] || reporte.estado
  const categoria = CATEGORIA_LABELS[reporte.categoria] || reporte.categoria
  const prioridad = PRIORIDAD_LABELS[reporte.prioridad || 'normal'] || reporte.prioridad
  const fecha = reporte.fecha ? new Date(reporte.fecha).toLocaleString('es-CO') : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Detalle del reporte</h3>
            <p className="text-xs text-muted-foreground">{reporte.especie}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar detalle">
            <X className="h-5 w-5" />
          </button>
        </div>

        {reporte.foto && (
          <div className="-mx-1 mb-4 overflow-hidden rounded-lg bg-muted">
            <img
              src={reporte.foto}
              alt={reporte.especie}
              className="h-56 w-full object-cover object-center"
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Summary label="Estado" value={estado} />
            <Summary label="Categoría" value={categoria} />
            <Summary label="Prioridad" value={prioridad} />
          </div>

          <section className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Atención</p>
            <div className="mt-2 space-y-2">
              <Detail label="Entidad" value={reporte.entidad_nombre || 'Sin entidad asignada'} />
              <Detail label="Nota de la entidad" value={reporte.nota_entidad} />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Información del caso</p>
            <div className="mt-2 space-y-2">
              <Detail label="Descripción" value={reporte.descripcion} />
              {reporte.estado !== 'rescatado' && <Detail label="Ubicación" value={reporte.ubicacion} />}
              <Detail label="Fecha" value={fecha} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Summary({ label, value }) {
  if (!value) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words text-sm text-foreground">{value}</p>
    </div>
  )
}
