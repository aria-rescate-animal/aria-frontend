import { MapPin, ShieldCheck } from 'lucide-react'
import {
  normalizarEstado, normalizarCategoria,
  ESTADO_SHORT, ESTADO_STYLE,
  CATEGORIA_LABELS, PRIORIDAD_STYLE, PRIORIDAD_LABELS
} from '@/lib/estados'

export function ReportCard({ report, hideLocation, actions, calm = false }) {
  const estado = normalizarEstado(report.estado || report.status)
  const categoria = normalizarCategoria(report.categoria || report.category)
  const prioridad = report.prioridad || 'normal'
  const st = ESTADO_STYLE[estado] || ESTADO_STYLE.pendiente
  const estadoTextClass = st.text || 'text-muted-foreground'
  const catLabel = CATEGORIA_LABELS[categoria] || categoria
  const priStyle = PRIORIDAD_STYLE[prioridad] || PRIORIDAD_STYLE.normal

  const photo = report.photo || report.foto
  const species = report.species || report.especie
  const desc = report.description || report.descripcion
  const loc = report.location?.address || report.ubicacion
  const date = report.createdAt || report.fecha
  const entidad = report.entidad_nombre
  const nota = report.nota_entidad
  const isResolved = estado === 'rescatado' || estado === 'no_procede'

  return (
    <article className={`${calm ? '' : 'group transition-shadow hover:shadow-md'} h-full overflow-hidden rounded-lg border bg-card ${isResolved ? 'opacity-80' : ''}`}>
      <div className="flex h-full md:flex-col">
        {/* En móvil: imagen cuadrada lateral. En desktop: imagen 16:9 arriba */}
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-muted md:h-auto md:w-full md:aspect-[16/9]">
          {photo ? (
            <img src={photo} alt={species}
              className={`h-full w-full object-cover object-center ${calm ? "" : "transition-transform duration-200 group-hover:scale-[1.02]"}`}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop' }} />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <span className="text-[10px] text-muted-foreground">Sin foto</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-2.5 md:p-3">
          <div className="space-y-1.5">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <h3 className="truncate text-sm font-bold text-foreground" title={species}>{species}</h3>
              {date && (
                <span className="flex-shrink-0 text-[10px] text-muted-foreground md:text-[11px]">
                  {new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className={`py-0.5 text-[10px] font-semibold md:text-xs ${estadoTextClass}`}>
                {ESTADO_SHORT[estado]}
              </span>
              <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 md:text-xs">
                {catLabel}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] md:text-xs ${priStyle.cls}`}>
                {PRIORIDAD_LABELS[prioridad] || prioridad}
              </span>
            </div>

            <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground md:text-xs">{desc}</p>

            {entidad && (
              <p className="truncate text-[10px] font-medium text-teal md:text-xs" title={entidad}>Entidad: {entidad}</p>
            )}
            {nota && (
              <p className="line-clamp-1 rounded bg-teal/5 px-2 py-1 text-[10px] text-teal md:text-xs" title={nota}>
                Nota: {nota}
              </p>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-[10px] text-muted-foreground md:text-[11px]">
            <span className="flex min-w-0 items-center gap-1 truncate">
              {!hideLocation && loc ? (
                <><MapPin className="h-3 w-3 flex-shrink-0 text-teal" /><span className="truncate">{loc}</span></>
              ) : isResolved ? (
                <><ShieldCheck className="h-3 w-3 flex-shrink-0 text-emerald-500" /><span className="font-medium text-emerald-600">Ubicación privada</span></>
              ) : null}
            </span>
          </div>

          {actions && <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border pt-2">{actions}</div>}
        </div>
      </div>
    </article>
  )
}
