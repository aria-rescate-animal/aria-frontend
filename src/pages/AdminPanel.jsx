import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { TabBroadcast } from '@/components/TabBroadcast'
import { obtenerToken } from '@/utils/auth.utils'
import { API_ADMIN_URL } from '@/config/api'
import { CATEGORIA_LABELS } from '@/lib/estados'
import {
  Users, FileWarning, ShieldCheck, Ban, ShieldAlert, Search, Check, X,
  Trash2, Eye, AlertTriangle, Activity, Building2, RefreshCw, Lock, Unlock,
  Phone, MapPin, Globe, Mail, Hash, FileText, Briefcase
} from 'lucide-react'

const auth = () => ({ headers: { Authorization: `Bearer ${obtenerToken()}` } })

const SERVICIOS_LABELS = {
  rescate_calle: 'Rescate de animales en calle',
  atencion_veterinaria: 'Atención veterinaria',
  hogar_temporal: 'Hogar temporal',
  maltrato: 'Casos de maltrato',
  cautiverio: 'Casos de cautiverio',
  fauna_silvestre: 'Fauna silvestre',
  adopcion_seguimiento: 'Adopción y seguimiento',
}
const STATUS_TABS = [
  { value: 'pendiente', label: 'Por aprobar' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Rechazadas' },
  { value: 'bloqueada', label: 'Bloqueadas' },
]

export default function AdminPanel() {
  const location = useLocation()
  const section = new URLSearchParams(location.search).get('s') || 'dashboard'
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {section === 'dashboard' && <TabDashboard />}
      {section === 'usuarios' && <TabUsuarios />}
      {section === 'entidades' && <TabEntidades />}
      {section === 'moderacion' && <TabModeracion />}
      {section === 'broadcast' && <TabBroadcast />}
    </div>
  )
}

function ErrorBox({ text }) {
  if (!text) return null
  return <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"><AlertTriangle className="h-4 w-4 flex-shrink-0" />{text}</div>
}

function TabDashboard() {
  const [stats, setStats] = useState(null)
  const [invalidos, setInvalidos] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    const load = async () => {
      setError('')
      try {
        const [{ data: st }, { data: inv }] = await Promise.all([
          axios.get(`${API_ADMIN_URL}/estadisticas`, auth()),
          axios.get(`${API_ADMIN_URL}/reportes-invalidos`, auth()),
        ])
        setStats(st)
        setInvalidos((inv || []).slice(0, 3))
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudo cargar el dashboard admin.')
      }
    }
    load()
  }, [])
  const cards = stats ? [
    { label: 'Total Usuarios', value: stats.total_usuarios, icon: Users, gradient: 'from-navy to-navy-light', desc: 'registrados' },
    { label: 'Reportes', value: stats.total_reportes, icon: FileWarning, gradient: 'from-orange-500 to-amber-500', desc: 'en el sistema' },
    { label: 'Rescatados', value: stats.rescatados, icon: ShieldCheck, gradient: 'from-emerald-500 to-teal', desc: 'casos cerrados' },
    { label: 'Bloqueados', value: stats.bloqueados, icon: Ban, gradient: 'from-destructive to-rose-600', desc: 'cuentas' },
    { label: 'En revisión', value: stats.invalidos, icon: ShieldAlert, gradient: 'from-amber-500 to-orange-500', desc: 'reportes' },
  ] : []
  return (
    <>
      <header className="flex items-end justify-between"><div><h1 className="text-xl font-bold text-foreground">Dashboard</h1><p className="mt-1 text-sm text-muted-foreground">Resumen general de la plataforma.</p></div><div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5 text-teal" /> Sistema activo</div></header>
      <ErrorBox text={error} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.length === 0 ? [1,2,3,4,5].map(i => <div key={i} className="rounded-lg border border-border bg-card p-5 animate-pulse"><div className="mb-3 h-3 w-28 rounded bg-muted" /><div className="h-8 w-16 rounded bg-muted" /></div>) : cards.map(s => <div key={s.label} className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md"><div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-10`} /><div className="relative mb-2 flex items-start justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p><div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${s.gradient} text-white`}><s.icon className="h-4 w-4" /></div></div><p className="text-3xl font-black text-foreground">{s.value ?? 0}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>)}
      </div>
      {invalidos.length > 0 && <div><h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><AlertTriangle className="h-4 w-4 text-orange-500" /> Reportes recientes en revisión</h2><div className="overflow-hidden rounded-lg border border-border bg-card"><table className="w-full text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-2.5 text-left font-semibold">Reporte</th><th className="px-4 py-2.5 text-left font-semibold">Motivo</th><th className="px-4 py-2.5 text-left font-semibold">Fecha</th></tr></thead><tbody className="divide-y divide-border">{invalidos.map(r => <tr key={r.id} className="hover:bg-muted/30"><td className="px-4 py-2.5 font-medium text-foreground">{r.especie}</td><td className="max-w-[240px] truncate px-4 py-2.5 text-muted-foreground">{r.motivo_reporte || '—'}</td><td className="px-4 py-2.5 text-xs text-muted-foreground">{r.fecha ? new Date(r.fecha).toLocaleDateString('es-CO') : '—'}</td></tr>)}</tbody></table></div></div>}
    </>
  )
}

function TabUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const cargar = async () => {
    setError('')
    try {
      const { data } = await axios.get(`${API_ADMIN_URL}/usuarios?page=1&limit=100`, auth())
      setUsuarios((data.usuarios || []).filter(u => u.rol === 'ciudadano'))
    } catch (err) { setError(err.response?.data?.error || 'No se pudieron cargar ciudadanos.') }
  }
  useEffect(() => { cargar() }, [])
  const filtered = usuarios.filter(u => u.nombre?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase()))
  const toggle = async (id, bloqueado) => {
    setError('')
    try {
      await axios.patch(`${API_ADMIN_URL}/usuarios/${id}/bloquear`, { accion: bloqueado ? 'desbloquear' : 'bloquear' }, auth())
      setUsuarios(p => p.map(u => u.id === id ? { ...u, bloqueado: !u.bloqueado } : u))
    } catch (err) { setError(err.response?.data?.error || 'No se pudo cambiar el estado del usuario.') }
  }
  const eliminar = async (id) => {
    if (!confirm('¿Seguro? Esta acción es irreversible.')) return
    setError('')
    try {
      await axios.delete(`${API_ADMIN_URL}/usuarios/${id}`, auth())
      setUsuarios(p => p.filter(u => u.id !== id))
    } catch (err) { setError(err.response?.data?.error || 'No se pudo eliminar el usuario.') }
  }
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-xl font-bold text-foreground">Ciudadanos</h1><p className="mt-1 text-sm text-muted-foreground">Cuentas registradas.</p></div><div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" /></div></header>
      <ErrorBox text={error} />
      <Table headers={['Nombre','Email','Estado','Acciones']} empty="No hay ciudadanos.">
        {filtered.map(u => <tr key={u.id} className="hover:bg-muted/30"><td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{(u.nombre||'U').substring(0,2).toUpperCase()}</div><span className="truncate font-medium text-foreground" title={u.nombre}>{u.nombre}</span></div></td><td className="px-4 py-3 text-muted-foreground"><span className="block max-w-[260px] truncate" title={u.email}>{u.email}</span></td><td className="px-4 py-3">{u.bloqueado ? <Badge cls="bg-red-50 text-red-700"><Ban className="h-3 w-3" /> Bloqueado</Badge> : <Badge cls="bg-emerald-50 text-emerald-700"><ShieldCheck className="h-3 w-3" /> Activo</Badge>}</td><td className="px-4 py-3 text-right"><button onClick={() => toggle(u.id, u.bloqueado)} className="mr-2 rounded-md border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted">{u.bloqueado ? 'Desbloquear' : 'Bloquear'}</button><button onClick={() => eliminar(u.id)} className="rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"><Trash2 className="inline h-3.5 w-3.5" /> Eliminar</button></td></tr>)}
      </Table>
    </>
  )
}

function TabEntidades() {
  const [entidades, setEntidades] = useState([])
  const [vista, setVista] = useState('pendiente')
  const [detalle, setDetalle] = useState(null)
  const [rechazando, setRechazando] = useState(null)
  const [bloqueando, setBloqueando] = useState(null) // entidad a bloquear (confirmación)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')

  const cargar = async () => {
    setError('')
    try {
      const { data } = await axios.get(`${API_ADMIN_URL}/usuarios?page=1&limit=200`, auth())
      setEntidades((data.usuarios || []).filter(u => u.rol === 'entidad'))
    } catch (err) { setError(err.response?.data?.error || 'No se pudieron cargar entidades.') }
  }
  useEffect(() => { cargar() }, [])

  const filtradas = useMemo(() => entidades.filter(e => {
    if (vista === 'pendiente') return e.aprobacion_pendiente === 1 || e.estado_aprobacion === 'pendiente'
    if (vista === 'bloqueada') return e.bloqueado === 1 || e.estado_aprobacion === 'bloqueada'
    if (vista === 'aprobada')  return e.estado_aprobacion === 'aprobada' && e.aprobacion_pendiente === 0 && e.bloqueado !== 1
    if (vista === 'rechazada') return e.estado_aprobacion === 'rechazada' && e.aprobacion_pendiente === 0
    return false
  }), [entidades, vista])

  const aprobar = async (id) => {
    setError('')
    try { await axios.patch(`${API_ADMIN_URL}/aprobar-entidad/${id}`, { accion: 'aprobar' }, auth()); setDetalle(null); await cargar() }
    catch (err) { setError(err.response?.data?.error || 'No se pudo aprobar la entidad.') }
  }
  const rechazar = async () => {
    if (!rechazando || !motivo.trim()) return
    setError('')
    try { await axios.patch(`${API_ADMIN_URL}/aprobar-entidad/${rechazando}`, { accion: 'rechazar', motivo: motivo.trim() }, auth()); setRechazando(null); setMotivo(''); await cargar() }
    catch (err) { setError(err.response?.data?.error || 'No se pudo rechazar la entidad.') }
  }
  const bloquear = async () => {
    if (!bloqueando) return
    setError('')
    try {
      await axios.patch(`${API_ADMIN_URL}/entidades/${bloqueando.id}/bloquear`, { accion: 'bloquear' }, auth())
      setBloqueando(null); setDetalle(null); await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo bloquear la entidad.') }
  }
  const desbloquear = async (id) => {
    setError('')
    try {
      await axios.patch(`${API_ADMIN_URL}/entidades/${id}/bloquear`, { accion: 'desbloquear' }, auth())
      setDetalle(null); await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo desbloquear la entidad.') }
  }

  return (
    <>
      <header><h1 className="text-xl font-bold text-foreground">Entidades</h1><p className="mt-1 text-sm text-muted-foreground">Revisión, aprobación y estado de entidades.</p></header>
      <ErrorBox text={error} />

      {/* Filtros consistentes con el resto del sistema */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => setVista(t.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${vista === t.value ? 'bg-navy text-white shadow-sm' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Table headers={['Entidad','Tipo','Servicios','Estado','Acciones']} empty="No hay entidades en esta vista.">
        {filtradas.map(e => {
          const esPendiente = e.aprobacion_pendiente === 1 || e.estado_aprobacion === 'pendiente'
          const esAprobada  = e.estado_aprobacion === 'aprobada' && e.bloqueado !== 1 && !esPendiente
          const esBloqueada = e.bloqueado === 1 || e.estado_aprobacion === 'bloqueada'
          const esRechazada = e.estado_aprobacion === 'rechazada' && !esPendiente

          const estadoLabel = esBloqueada ? 'bloqueada'
            : esPendiente ? 'pendiente'
            : e.estado_aprobacion || 'aprobada'
          const estadoCls = esBloqueada ? 'bg-red-50 text-red-700 border-red-200'
            : esPendiente ? 'bg-amber-50 text-amber-700 border-amber-200'
            : esRechazada ? 'bg-slate-50 text-slate-700 border-slate-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'

          return (
            <tr key={e.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="max-w-[260px] truncate font-medium text-foreground" title={e.nombre_organizacion || e.nombre}>{e.nombre_organizacion || e.nombre}</p>
                <p className="text-xs text-muted-foreground">{e.email}</p>
              </td>
              <td className="px-4 py-3 text-xs capitalize text-muted-foreground">{e.tipo_entidad?.replace(/_/g,' ') || '—'}</td>
              <td className="px-4 py-3"><Servicios servicios={e.servicios_ofrecidos} /></td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${estadoCls}`}>
                  {estadoLabel}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-1.5">
                  <button onClick={() => setDetalle(e)} className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted">
                    <Eye className="inline h-3.5 w-3.5" /> Ver
                  </button>
                  {esPendiente && (
                    <>
                      <button onClick={() => aprobar(e.id)} className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"><Check className="inline h-3.5 w-3.5" /> Aprobar</button>
                      <button onClick={() => { setRechazando(e.id); setMotivo('') }} className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"><X className="inline h-3.5 w-3.5" /> Rechazar</button>
                    </>
                  )}
                  {esAprobada && (
                    <button onClick={() => setBloqueando(e)} className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">
                      <Lock className="inline h-3.5 w-3.5" /> Bloquear
                    </button>
                  )}
                  {esBloqueada && (
                    <button onClick={() => desbloquear(e.id)} className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                      <Unlock className="inline h-3.5 w-3.5" /> Desbloquear
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      </Table>

      {detalle && (
        <EntidadModal
          entidad={detalle}
          onClose={() => setDetalle(null)}
          onAprobar={() => aprobar(detalle.id)}
          onRechazar={() => { setRechazando(detalle.id); setMotivo(''); setDetalle(null) }}
          onBloquear={() => setBloqueando(detalle)}
          onDesbloquear={() => desbloquear(detalle.id)}
        />
      )}

      {rechazando && (
        <Modal onClose={() => setRechazando(null)}>
          <h3 className="mb-2 text-base font-bold text-foreground">Rechazar entidad</h3>
          <p className="mb-3 text-sm text-muted-foreground">Indica el motivo. La entidad será notificada.</p>
          <div className="mb-3 space-y-2">
            {['La información enviada es insuficiente.','El NIT ingresado no tiene un formato válido.','No se pudo identificar claramente la actividad de la entidad.','El tipo de entidad no coincide con los servicios declarados.'].map(m => (
              <button key={m} onClick={() => setMotivo(m)} className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${motivo === m ? 'border-navy bg-navy/5 text-navy font-semibold' : 'border-border text-muted-foreground hover:bg-muted'}`}>{m}</button>
            ))}
          </div>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} placeholder="O escribe un motivo personalizado..." className="mb-3 w-full resize-none rounded-lg border border-input bg-card p-2.5 text-sm outline-none focus:border-ring" />
          <div className="flex gap-2">
            <button onClick={() => setRechazando(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold hover:bg-muted">Cancelar</button>
            <button onClick={rechazar} disabled={!motivo.trim()} className="flex-1 rounded-lg bg-destructive py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">Confirmar rechazo</button>
          </div>
        </Modal>
      )}

      {bloqueando && (
        <Modal onClose={() => setBloqueando(null)}>
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600" />
            <h3 className="text-base font-bold text-foreground">Bloquear entidad</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            ¿Confirmas bloquear la entidad <strong className="text-foreground">{bloqueando.nombre_organizacion || bloqueando.nombre}</strong>?
            Dejará de recibir reportes hasta que la reactives.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setBloqueando(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold hover:bg-muted">Cancelar</button>
            <button onClick={bloquear} className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:opacity-90">Sí, bloquear</button>
          </div>
        </Modal>
      )}
    </>
  )
}

function TabModeracion() {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [assigning, setAssigning] = useState(null)
  const [entidades, setEntidades] = useState([])
  const [entidadId, setEntidadId] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState('')
  const cargar = async () => {
    setError('')
    try {
      const [{ data: invalidos }, { data: sinEntidad }] = await Promise.all([
        axios.get(`${API_ADMIN_URL}/reportes-invalidos`, auth()),
        axios.get(`${API_ADMIN_URL}/reportes-sin-entidad`, auth()),
      ])
      const rows = [...(invalidos || []).map(r => ({ ...r, origen: 'reporte marcado' })), ...(sinEntidad || []).map(r => ({ ...r, origen: 'sin entidad' }))]
      const dedup = Array.from(new Map(rows.map(r => [r.id, r])).values())
      setData(dedup)
    } catch (err) { setError(err.response?.data?.error || 'No se pudieron cargar reportes en revisión.') }
  }
  useEffect(() => { cargar() }, [])
  const remove = async (id) => {
    if (!confirm('¿Eliminar este reporte?')) return
    setError('')
    try { await axios.delete(`${API_ADMIN_URL}/reportes/${id}`, auth()); setData(p => p.filter(r => r.id !== id)); if (selected?.id === id) setSelected(null) }
    catch (err) { setError(err.response?.data?.error || 'No se pudo eliminar el reporte.') }
  }
  const openAssign = async (r) => {
    setAssigning(r); setEntidadId(''); setNota(''); setError('')
    try { const { data } = await axios.get(`${API_ADMIN_URL}/entidades?categoria=${r.categoria || ''}`, auth()); setEntidades(data || []) }
    catch (err) { setError(err.response?.data?.error || 'No se pudieron cargar entidades compatibles.') }
  }
  const asignar = async () => {
    if (!assigning || !entidadId) return
    setError('')
    try {
      await axios.patch(`${API_ADMIN_URL}/reportes/${assigning.id}/asignar`, { entidad_id: entidadId, nota }, auth())
      setAssigning(null); setSelected(null); await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo asignar el reporte.') }
  }
  return (
    <>
      <header className="flex items-end justify-between"><div><h1 className="text-xl font-bold text-foreground">Moderación</h1><p className="mt-1 text-sm text-muted-foreground">Reportes marcados, sin entidad o que requieren revisión.</p></div><button onClick={cargar} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"><RefreshCw className="h-3.5 w-3.5" /> Actualizar</button></header>
      <ErrorBox text={error} />
      <Table headers={['Reporte','Categoría','Origen','Motivo','Acción']} empty="Sin reportes en revisión.">
        {data.map(r => <tr key={r.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(r)}><td className="px-4 py-3"><p className="font-medium text-foreground">{r.especie}</p><p className="line-clamp-1 text-xs text-muted-foreground">{r.descripcion}</p></td><td className="px-4 py-3 text-xs text-muted-foreground">{CATEGORIA_LABELS[r.categoria] || r.categoria || '—'}</td><td className="px-4 py-3 text-xs text-muted-foreground">{r.origen || 'revisión'}</td><td className="max-w-[180px] truncate px-4 py-3 text-xs text-muted-foreground">{r.motivo_reporte || '—'}</td><td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}><button onClick={() => openAssign(r)} className="mr-2 rounded-md bg-navy px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"><Building2 className="inline h-3.5 w-3.5" /> Asignar</button><button onClick={() => remove(r.id)} className="rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"><Trash2 className="inline h-3.5 w-3.5" /></button></td></tr>)}
      </Table>
      {selected && <Modal onClose={() => setSelected(null)}><h3 className="mb-4 text-base font-bold text-foreground">Detalle del reporte</h3><div className="space-y-3"><Info label="Especie" value={selected.especie} /><Info label="Estado" value={selected.estado} /><Info label="Categoría" value={CATEGORIA_LABELS[selected.categoria] || selected.categoria} /><Info label="Descripción" value={selected.descripcion} /><Info label="Motivo" value={selected.motivo_reporte} /><Info label="Ubicación" value={selected.ubicacion} /><Info label="Entidad" value={selected.entidad_asignada_id ? `ID ${selected.entidad_asignada_id}` : 'Sin entidad asignada'} /></div><div className="mt-5 flex gap-2"><button onClick={() => setSelected(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold hover:bg-muted">Cerrar</button><button onClick={() => openAssign(selected)} className="flex-1 rounded-lg bg-navy py-2 text-sm font-semibold text-white hover:opacity-90">Asignar entidad</button></div></Modal>}
      {assigning && <Modal onClose={() => setAssigning(null)}><h3 className="mb-2 text-base font-bold text-foreground">Asignar entidad</h3><p className="mb-3 text-sm text-muted-foreground">Caso: {assigning.especie}. Solo se listan entidades compatibles.</p><select value={entidadId} onChange={e => setEntidadId(e.target.value)} className="mb-3 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring"><option value="">Selecciona entidad</option>{entidades.map(e => <option key={e.id} value={e.id}>{e.nombre_organizacion || e.nombre}</option>)}</select><textarea value={nota} onChange={e => setNota(e.target.value)} rows={3} placeholder="Nota opcional para entidad/ciudadano" className="mb-3 w-full resize-none rounded-lg border border-input bg-card p-2.5 text-sm outline-none focus:border-ring" /><div className="flex gap-2"><button onClick={() => setAssigning(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold hover:bg-muted">Cancelar</button><button onClick={asignar} disabled={!entidadId} className="flex-1 rounded-lg bg-navy py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">Asignar</button></div></Modal>}
    </>
  )
}

function Table({ headers, children, empty }) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children
  const hasRows = Array.isArray(rows) ? rows.length > 0 : Boolean(rows)
  return <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[760px] text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr>{headers.map(h => <th key={h} className={`px-4 py-3 font-semibold ${h === 'Acciones' || h === 'Acción' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{hasRows ? rows : <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-muted-foreground">{empty}</td></tr>}</tbody></table></div>
}
function Badge({ cls, children }) { return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span> }
function parseServicios(servicios) {
  if (!servicios) return []
  if (Array.isArray(servicios)) return servicios.filter(Boolean)
  const raw = String(servicios).trim()
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
  } catch {
    // Si no es JSON valido, se interpreta como CSV.
  }
  return raw.split(',')
    .map(s => s.trim())
    .map(s => {
      let value = s
      while (value && ['"', "'", '[', ']'].includes(value[0])) value = value.slice(1).trim()
      while (value && ['"', "'", '[', ']'].includes(value[value.length - 1])) value = value.slice(0, -1).trim()
      return value
    })
    .filter(Boolean)
}
function Servicios({ servicios }) { const arr = parseServicios(servicios); if (!arr.length) return <span className="text-xs text-muted-foreground">—</span>; return <div className="flex max-w-[300px] flex-wrap gap-1">{arr.map(s => <span key={s} className="rounded bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">{SERVICIOS_LABELS[s] || s}</span>)}</div> }
function safeValue(value) {
  if (value === null || value === undefined || value === '') return 'No registrado'
  return value
}
function Info({ label, value }) { return <div><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-0.5 break-words text-sm text-foreground">{safeValue(value)}</p></div> }

function ChecklistEntidad({ entidad }) {
  const servicios = parseServicios(entidad.servicios_ofrecidos)
  const nit = String(entidad.nit || '').replace(/\D/g, '')
  const tel = String(entidad.telefono_oficial || entidad.telefono || '').replace(/\D/g, '')
  const checks = [
    { label: 'NIT válido', ok: nit.length >= 9 && nit.length <= 10 },
    { label: 'Teléfono válido', ok: tel.length === 10 },
    { label: 'Servicios seleccionados', ok: servicios.length > 0 },
    { label: 'Descripción suficiente', ok: String(entidad.descripcion_entidad || '').trim().length >= 20 },
  ]
  return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="mb-2 text-xs font-semibold text-foreground">Datos mínimos para aprobación</p><div className="grid gap-1.5 sm:grid-cols-2">{checks.map(c => <span key={c.label} className={`text-xs ${c.ok ? 'text-emerald-700' : 'text-amber-700'}`}>{c.ok ? '✓' : '•'} {c.label}</span>)}</div></div>
}

function Modal({ children, onClose }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl">{children}</div></div> }

/* ── MODAL ENTIDAD — ahora con secciones claras ─────────────── */
function EntidadModal({ entidad, onClose, onAprobar, onRechazar, onBloquear, onDesbloquear }) {
  const esPendiente = entidad.aprobacion_pendiente === 1 || entidad.estado_aprobacion === 'pendiente'
  const esAprobada  = entidad.estado_aprobacion === 'aprobada' && entidad.bloqueado !== 1 && !esPendiente
  const esBloqueada = entidad.bloqueado === 1 || entidad.estado_aprobacion === 'bloqueada'
  const esRechazada = entidad.estado_aprobacion === 'rechazada' && !esPendiente

  const estadoLabel = esBloqueada ? 'Bloqueada'
    : esPendiente ? 'Pendiente de aprobación'
    : esRechazada ? 'Rechazada'
    : 'Aprobada'
  const estadoCls = esBloqueada ? 'bg-red-50 text-red-700 border-red-200'
    : esPendiente ? 'bg-amber-50 text-amber-700 border-amber-200'
    : esRechazada ? 'bg-slate-50 text-slate-700 border-slate-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200'

  return (
    <Modal onClose={onClose}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal">Entidad</p>
          <h3 className="truncate text-base font-bold text-foreground" title={entidad.nombre_organizacion || entidad.nombre}>{entidad.nombre_organizacion || entidad.nombre}</h3>
          <span className={`mt-1 inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${estadoCls}`}>
            {estadoLabel}
          </span>
        </div>
        <button onClick={onClose} className="flex-shrink-0 text-muted-foreground hover:text-foreground" aria-label="Cerrar"><X className="h-5 w-5" /></button>
      </div>

      {/* Secciones */}
      <div className="space-y-4">
        <SectionEntidad title="Datos básicos">
          <Info label="Email" value={entidad.email} />
          <Info label="Representante" value={entidad.representante} />
          <Info label="Tipo de entidad" value={entidad.tipo_entidad?.replace(/_/g,' ')} />
        </SectionEntidad>

        <SectionEntidad title="Información legal">
          <Info label="NIT" value={entidad.nit} />
          <Info label="Sitio web" value={entidad.enlace_verificacion} />
        </SectionEntidad>

        <SectionEntidad title="Contacto">
          <Info label="Teléfono" value={entidad.telefono_oficial || entidad.telefono} />
          <Info label="Ciudad" value={entidad.ciudad} />
          <Info label="Dirección" value={entidad.direccion_sede || entidad.direccion} />
        </SectionEntidad>

        <SectionEntidad title="Servicios">
          <div className="col-span-full"><Servicios servicios={entidad.servicios_ofrecidos} /></div>
        </SectionEntidad>

        <SectionEntidad title="Estado">
          <Info label="Estado actual" value={estadoLabel} />
          <Info label="Aprobacion pendiente" value={esPendiente ? 'Si' : 'No'} />
          <Info label="Aprobada en" value={entidad.aprobado_en ? new Date(entidad.aprobado_en).toLocaleDateString('es-CO') : null} />
          <Info label="Rechazada en" value={entidad.rechazado_en ? new Date(entidad.rechazado_en).toLocaleDateString('es-CO') : null} />
        </SectionEntidad>

        <SectionEntidad title="Descripción">
          <div className="col-span-full"><p className="text-sm leading-relaxed text-foreground">{entidad.descripcion_entidad || 'No registrada.'}</p></div>
        </SectionEntidad>

        {entidad.motivo_rechazo && (
          <SectionEntidad title="Motivo de rechazo">
            <div className="col-span-full"><p className="text-sm leading-relaxed text-red-700">{entidad.motivo_rechazo}</p></div>
          </SectionEntidad>
        )}

        <ChecklistEntidad entidad={entidad} />
      </div>

      {/* Acciones contextuales */}
      <div className="mt-5 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
        {esPendiente && (
          <>
            <button onClick={onAprobar} className="rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:opacity-90"><Check className="inline h-4 w-4" /> Aprobar</button>
            <button onClick={onRechazar} className="rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"><X className="inline h-4 w-4" /> Rechazar</button>
          </>
        )}
        {esAprobada && (
          <button onClick={onBloquear} className="rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 sm:col-span-2">
            <Lock className="inline h-4 w-4" /> Bloquear entidad
          </button>
        )}
        {esBloqueada && (
          <button onClick={onDesbloquear} className="rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:col-span-2">
            <Unlock className="inline h-4 w-4" /> Desbloquear y reactivar
          </button>
        )}
      </div>
    </Modal>
  )
}

function SectionEntidad({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-teal">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  )
}
