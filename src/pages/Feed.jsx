import { useMemo, useState, useEffect } from 'react'
import { obtenerReportes, actualizarEstado, reportarInvalido } from '@/services/reportes.service'
import { ReportCard } from '@/components/ReportCard'
import { normalizarEstado, normalizarCategoria, ESTADO_LABELS, CATEGORIA_LABELS } from '@/lib/estados'
import { MapPin, Clock, User, Navigation, X, RefreshCw, AlertCircle, Flag, Eye, CheckCircle2 } from 'lucide-react'

const FILTROS_ESTADO = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_atencion', label: 'En atención' },
  { value: 'rescatado', label: 'Rescatado' },
  { value: 'requiere_revision', label: 'Revisión' },
]
const FILTROS_CAT = [
  { value: 'todas', label: 'Todas' },
  { value: 'abandono', label: 'Abandonado' },
  { value: 'herido', label: 'Herido o accidentado' },
  { value: 'enfermo', label: 'Enfermo o débil' },
  { value: 'maltrato', label: 'Maltrato' },
  { value: 'cautiverio', label: 'Cautiverio' },
  { value: 'fauna_silvestre', label: 'Fauna silvestre' },
]

export default function Feed() {
  const [reports, setReports] = useState([])
  const [hiddenIds, setHiddenIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterCat, setFilterCat] = useState('todas')
  const [selected, setSelected] = useState(null)
  const [actionError, setActionError] = useState('')
  const [stateAction, setStateAction] = useState(null)
  const [stateNote, setStateNote] = useState('')
  const [reviewFor, setReviewFor] = useState(null)
  const [reviewType, setReviewType] = useState('posible_falso')
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  const cargar = async () => {
    setLoading(true); setError('')
    try {
      const data = await obtenerReportes()
      setReports((data || []).map(r => ({ ...r, estado: normalizarEstado(r.estado), categoria: normalizarCategoria(r.categoria) })))
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los casos. Verifica que el servidor esté activo.')
    } finally { setLoading(false) }
  }
  useEffect(() => { cargar() }, [])

  const visible = useMemo(() => reports
    .filter(r => !hiddenIds.has(r.id))
    .filter(r => r.reportado_invalido !== 1)
    .filter(r => filterEstado === 'todos' || r.estado === filterEstado)
    .filter(r => filterCat === 'todas' || r.categoria === filterCat), [reports, hiddenIds, filterEstado, filterCat])

  const activos = visible.filter(r => r.estado !== 'rescatado' && r.estado !== 'no_procede')
  const resueltos = visible.filter(r => r.estado === 'rescatado' || r.estado === 'no_procede')
  const pendientesCount = reports.filter(r => r.estado === 'pendiente' && !hiddenIds.has(r.id)).length

  const openStateModal = (report, estado, title, e) => {
    e?.stopPropagation()
    setActionError('')
    setStateNote('')
    setStateAction({ report, estado, title })
  }

  const confirmState = async () => {
    if (!stateAction) return
    try {
      const { report, estado } = stateAction
      const resp = await actualizarEstado(report.id, estado, stateNote.trim() || null)
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, estado: resp.estado || estado, nota_entidad: resp.nota || stateNote.trim() || r.nota_entidad } : r))
      setSelected(prev => prev?.id === report.id ? { ...prev, estado: resp.estado || estado, nota_entidad: resp.nota || stateNote.trim() || prev.nota_entidad } : prev)
      setStateAction(null); setStateNote('')
    } catch (err) {
      setActionError(err.response?.data?.message || 'No se pudo actualizar el caso. Intenta de nuevo.')
    }
  }

  const confirmReview = async () => {
    if (!reviewFor) return
    if (reason.trim().length < 5) { setReasonError('El motivo debe tener al menos 5 caracteres.'); return }
    setReasonError('')
    try {
      await reportarInvalido(reviewFor.id, reason.trim(), reviewType)
      setHiddenIds(prev => new Set([...prev, reviewFor.id]))
      setReviewFor(null); setReason(''); setReviewType('posible_falso')
    } catch (err) {
      setReasonError(err.response?.data?.message || 'No se pudo enviar a revisión. Intenta de nuevo.')
    }
  }

  const openRoute = (r, e) => {
    e?.stopPropagation()
    if (r.latitud && r.longitud) window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.latitud},${r.longitud}`, '_blank')
    else if (r.ubicacion) window.open(`https://www.google.com/maps/search/${encodeURIComponent(r.ubicacion)}`, '_blank')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Casos activos</h1>
          <p className="text-sm text-muted-foreground">{pendientesCount > 0 ? <span className="font-semibold text-red-600">{pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''} sin atender</span> : 'Sin casos pendientes'}</p>
        </div>
        <button onClick={cargar} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"><RefreshCw className="h-3.5 w-3.5" /> Actualizar</button>
      </div>

      {error && <Notice text={error} />}
      {actionError && <Notice text={actionError} onClose={() => setActionError('')} />}

      {/* Filtros consistentes (pills) */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <FilterGroup label="Estado" items={FILTROS_ESTADO} value={filterEstado} setValue={setFilterEstado} variant="navy" />
          <FilterGroup label="Tipo" items={FILTROS_CAT} value={filterCat} setValue={setFilterCat} variant="teal" />
        </div>
      </section>

      {loading ? <Skeleton /> : visible.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-border bg-card py-12 text-center"><AlertCircle className="mx-auto mb-2 h-6 w-6 text-muted-foreground" /><p className="text-sm text-muted-foreground">No hay casos con esos filtros.</p></div>
      ) : (
        <>
          {activos.length > 0 && <ReportSection title={`Requieren atención · ${activos.length}`} reports={activos} setSelected={setSelected} />}
          {activos.length > 0 && resueltos.length > 0 && <div className="flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Resueltos</span><div className="h-px flex-1 bg-border" /></div>}
          {resueltos.length > 0 && <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 opacity-75">{resueltos.map(r => <ReportCard key={r.id} report={r} hideLocation calm actions={<button onClick={() => setSelected(r)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"><Eye className="h-3.5 w-3.5" /> Ver detalle</button>} />)}</div>}
        </>
      )}

      {selected && <DetalleModal selected={selected} setSelected={setSelected} openRoute={openRoute} openStateModal={openStateModal} setReviewFor={setReviewFor} setReasonError={setReasonError} />}
      {stateAction && <StateModal action={stateAction} note={stateNote} setNote={setStateNote} onCancel={() => setStateAction(null)} onConfirm={confirmState} />}
      {reviewFor && <ReviewModal report={reviewFor} type={reviewType} setType={setReviewType} reason={reason} setReason={setReason} error={reasonError} setError={setReasonError} onCancel={() => { setReviewFor(null); setReason(''); setReasonError('') }} onConfirm={confirmReview} />}
    </div>
  )
}

function ReportSection({ title, reports, setSelected }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {reports.map(r => (
          <ReportCard
            key={r.id}
            report={r}
            calm
            actions={
              <button
                onClick={() => setSelected(r)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
              >
                <Eye className="h-3.5 w-3.5" /> Ver detalle
              </button>
            }
          />
        ))}
      </div>
    </div>
  )
}

function Notice({ text, onClose }) {
  return <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-2"><div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 flex-shrink-0" />{text}</div>{onClose && <button onClick={onClose}><X className="h-4 w-4" /></button>}</div>
}

/* Pill reutilizable y consistente con AnimalesPerdidos */
function FilterGroup({ label, items, value, setValue, variant = 'navy' }) {
  const activeCls = variant === 'teal' ? 'bg-teal text-white shadow-sm' : 'bg-navy text-white shadow-sm'
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      {items.map(f => (
        <button key={f.value} onClick={() => setValue(f.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${value === f.value ? activeCls : 'bg-muted text-foreground hover:bg-muted/80'}`}>
          {f.label}
        </button>
      ))}
    </div>
  )
}

function Skeleton() { return <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <div key={i} className="rounded-lg border border-border bg-card animate-pulse"><div className="aspect-[16/9] bg-muted rounded-t-lg" /><div className="p-3 space-y-2"><div className="h-3.5 bg-muted rounded w-2/3" /><div className="h-3 bg-muted rounded w-full" /></div></div>)}</div> }

function DetalleModal({ selected, setSelected, openRoute, openStateModal, setReviewFor, setReasonError }) {
  const closeAndState = (estado, title) => {
    const report = selected
    setSelected(null)
    openStateModal(report, estado, title)
  }

  const sendReview = () => {
    const report = selected
    setSelected(null)
    setReviewFor(report)
    setReasonError('')
  }

  return (
    <Modal onClose={() => setSelected(null)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-foreground" title={selected.especie}>{selected.especie}</h3>
          <p className="text-xs text-muted-foreground">{CATEGORIA_LABELS[selected.categoria] || selected.categoria}</p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{ESTADO_LABELS[selected.estado] || selected.estado}</p>
        </div>
        <button onClick={() => setSelected(null)} className="ml-3 flex-shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Imagen con object-cover + object-center para no recortar mal */}
      {selected.foto && (
        <div className="mb-3 overflow-hidden rounded-lg bg-muted">
          <img src={selected.foto} alt={selected.especie} className="h-56 w-full object-contain" />
        </div>
      )}

      <p className="mb-3 text-sm leading-relaxed text-foreground">{selected.descripcion}</p>

      {selected.nota_entidad && (
        <div className="mb-3 rounded-lg border border-teal/20 bg-teal/5 px-3 py-2 text-xs text-teal">
          <strong>Nota de la entidad:</strong> {selected.nota_entidad}
        </div>
      )}

      <div className="space-y-1.5 text-xs text-muted-foreground">
        {selected.ubicacion && selected.estado !== 'rescatado' && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-teal" />
            <span className="truncate">{selected.ubicacion}</span>
          </div>
        )}
        {selected.entidad_nombre && <div className="truncate font-medium text-teal">Entidad: {selected.entidad_nombre}</div>}
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{selected.reportadoPor || 'Ciudadano'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          {selected.fecha ? new Date(selected.fecha).toLocaleDateString('es-CO') : ''}
        </div>
      </div>

      {/* Botones en grid limpio con jerarquía clara */}
      <div className="mt-4 border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Acciones del caso</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {/* Acción principal: asumir / marcar rescatado */}
          {selected.estado === 'pendiente' && (
            <button onClick={() => closeAndState('en_atencion', 'Asumir caso')} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition sm:col-span-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Asumir caso
            </button>
          )}
          {selected.estado === 'en_atencion' && (
            <button onClick={() => closeAndState('rescatado', 'Marcar rescatado')} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition sm:col-span-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Marcar rescatado
            </button>
          )}

          {/* Acción secundaria: no procede */}
          {selected.estado !== 'rescatado' && selected.estado !== 'requiere_revision' && (
            <button onClick={() => closeAndState('no_procede', 'No procede')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition">
              No procede
            </button>
          )}

          {/* Acción secundaria: abrir ruta */}
          <button onClick={(e) => openRoute(selected, e)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition">
            <Navigation className="h-3.5 w-3.5" /> Abrir ruta
          </button>

          {/* Advertencia: enviar a revisión */}
          {selected.estado !== 'rescatado' && (
            <button onClick={sendReview} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition sm:col-span-2">
              <Flag className="h-3.5 w-3.5" /> Enviar a revisión
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function StateModal({ action, note, setNote, onCancel, onConfirm }) { return <Modal onClose={onCancel}><h3 className="text-base font-bold text-foreground mb-1">{action.title}</h3><p className="text-sm text-muted-foreground mb-3">Agrega una nota de seguimiento para el ciudadano y el administrador.</p><textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Ej: La entidad se dirige al lugar..." className="w-full rounded-lg border border-input bg-card p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none mb-3" /><div className="flex gap-2 justify-end"><button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted transition">Cancelar</button><button onClick={onConfirm} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition">Confirmar</button></div></Modal> }
function ReviewModal({ type, setType, reason, setReason, error, setError, onCancel, onConfirm }) { return <Modal onClose={onCancel}><div className="flex items-start justify-between mb-3"><h3 className="text-base font-bold text-foreground">Enviar a revisión</h3><button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button></div><p className="text-sm text-muted-foreground mb-3">El administrador revisará este caso. No se penaliza automáticamente al ciudadano.</p><div className="grid gap-2 mb-3"><label className={`rounded-lg border p-3 text-sm cursor-pointer ${type === 'posible_falso' ? 'border-navy bg-navy/5' : 'border-border'}`}><input type="radio" name="tipoRevision" value="posible_falso" checked={type === 'posible_falso'} onChange={() => setType('posible_falso')} className="mr-2 accent-navy" />Posible falso</label><label className={`rounded-lg border p-3 text-sm cursor-pointer ${type === 'no_corresponde' ? 'border-navy bg-navy/5' : 'border-border'}`}><input type="radio" name="tipoRevision" value="no_corresponde" checked={type === 'no_corresponde'} onChange={() => setType('no_corresponde')} className="mr-2 accent-navy" />No corresponde a mi entidad</label></div><textarea value={reason} onChange={e => { setReason(e.target.value); setError('') }} rows={3} placeholder="Explica el motivo (mínimo 5 caracteres)" className="w-full rounded-lg border border-input bg-card p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none mb-2" />{error && <p className="text-xs text-destructive mb-2">{error}</p>}<div className="flex gap-2 justify-end"><button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted transition">Cancelar</button><button onClick={onConfirm} disabled={reason.trim().length < 5} className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">Enviar revisión</button></div></Modal> }
function Modal({ children, onClose }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}><div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl max-h-[90vh] overflow-y-auto">{children}</div></div> }
