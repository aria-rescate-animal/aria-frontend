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
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'pendiente', label: 'Por aprobar' },
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

function SuccessBox({ text }) {
  if (!text) return null
  return <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><Check className="h-4 w-4 flex-shrink-0" />{text}</div>
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
    { label: 'Usuarios registrados', value: stats.total_usuarios, icon: Users, gradient: 'from-navy to-navy-light', desc: 'en la plataforma' },
    { label: 'Reportes', value: stats.total_reportes, icon: FileWarning, gradient: 'from-orange-500 to-amber-500', desc: 'en el sistema' },
    { label: 'Rescatados', value: stats.rescatados, icon: ShieldCheck, gradient: 'from-emerald-500 to-teal', desc: 'casos cerrados' },
    { label: 'Bloqueados', value: stats.bloqueados, icon: Ban, gradient: 'from-destructive to-rose-600', desc: 'cuentas' },
    { label: 'En revisión', value: stats.invalidos, icon: ShieldAlert, gradient: 'from-amber-500 to-orange-500', desc: 'casos por evaluar' },
  ] : []
  return (
    <>
      <header className="flex items-end justify-between"><div><h1 className="text-xl font-bold text-foreground">Panel de administración</h1><p className="mt-1 text-sm text-muted-foreground">Indicadores principales para supervisar usuarios, entidades, reportes y revisión operativa.</p></div><div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5 text-teal" /> Operación activa</div></header>
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
  const [eliminandoUsuario, setEliminandoUsuario] = useState(null)
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
  const eliminar = async () => {
    if (!eliminandoUsuario) return
    setError('')
    try {
      await axios.delete(`${API_ADMIN_URL}/usuarios/${eliminandoUsuario.id}`, auth())
      setUsuarios(p => p.filter(u => u.id !== eliminandoUsuario.id))
      setEliminandoUsuario(null)
    } catch (err) { setError(err.response?.data?.error || 'No se pudo eliminar el usuario.') }
  }
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-xl font-bold text-foreground">Ciudadanos</h1><p className="mt-1 text-sm text-muted-foreground">Cuentas registradas.</p></div><div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..." className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" /></div></header>
      <ErrorBox text={error} />
      <Table headers={['Nombre','Email','Estado','Acciones']} empty="No hay ciudadanos.">
        {filtered.map(u => <tr key={u.id} className="hover:bg-muted/30"><td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{(u.nombre||'U').substring(0,2).toUpperCase()}</div><span className="truncate font-medium text-foreground" title={u.nombre}>{u.nombre}</span></div></td><td className="px-4 py-3 text-muted-foreground"><span className="block max-w-[260px] truncate" title={u.email}>{u.email}</span></td><td className="px-4 py-3">{u.bloqueado ? <Badge cls="bg-red-50 text-red-700"><Ban className="h-3 w-3" /> Bloqueado</Badge> : <Badge cls="bg-emerald-50 text-emerald-700"><ShieldCheck className="h-3 w-3" /> Activo</Badge>}</td><td className="px-4 py-3 text-right"><button onClick={() => toggle(u.id, u.bloqueado)} className="mr-2 rounded-md border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted">{u.bloqueado ? 'Desbloquear' : 'Bloquear'}</button><button onClick={() => setEliminandoUsuario(u)} className="rounded-md bg-destructive px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"><Trash2 className="inline h-3.5 w-3.5" /> Eliminar</button></td></tr>)}
      </Table>
      {eliminandoUsuario && (
        <ConfirmDialog
          title="Eliminar usuario"
          message="¿Seguro que deseas eliminar este usuario?"
          confirmText="Eliminar"
          onCancel={() => setEliminandoUsuario(null)}
          onConfirm={eliminar}
        />
      )}
    </>
  )
}

function TabEntidades() {
  const [entidades, setEntidades] = useState([])
  const [vista, setVista] = useState('aprobada')
  const [detalle, setDetalle] = useState(null)
  const [rechazando, setRechazando] = useState(null)
  const [bloqueando, setBloqueando] = useState(null) // entidad a bloquear (confirmación)
  const [eliminando, setEliminando] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    setSuccess('')
    try {
      await axios.patch(`${API_ADMIN_URL}/aprobar-entidad/${id}`, { accion: 'aprobar' }, auth())
      setDetalle(null)
      setSuccess('Entidad aprobada correctamente. Se notificó el resultado por correo y en la plataforma.')
      await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo aprobar la entidad.') }
  }
  const rechazar = async () => {
    if (!rechazando || !motivo.trim()) return
    setError('')
    setSuccess('')
    try {
      await axios.patch(`${API_ADMIN_URL}/aprobar-entidad/${rechazando}`, { accion: 'rechazar', motivo: motivo.trim() }, auth())
      setRechazando(null)
      setMotivo('')
      setSuccess('Entidad rechazada correctamente. Se notificó el motivo por correo y en la plataforma.')
      await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo rechazar la entidad.') }
  }
  const bloquear = async () => {
    if (!bloqueando) return
    setError('')
    setSuccess('')
    try {
      await axios.patch(`${API_ADMIN_URL}/entidades/${bloqueando.id}/bloquear`, { accion: 'bloquear' }, auth())
      setBloqueando(null)
      setDetalle(null)
      setSuccess('Entidad bloqueada correctamente. La cuenta queda fuera de operación hasta su reactivación.')
      await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo bloquear la entidad.') }
  }
  const desbloquear = async (id) => {
    setError('')
    setSuccess('')
    try {
      await axios.patch(`${API_ADMIN_URL}/entidades/${id}/bloquear`, { accion: 'desbloquear' }, auth())
      setDetalle(null)
      setSuccess('Entidad reactivada correctamente. Ya puede operar nuevamente en ARIA.')
      await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo desbloquear la entidad.') }
  }
  const eliminarEntidad = async () => {
    if (!eliminando) return
    setError('')
    setSuccess('')
    try {
      await axios.delete(`${API_ADMIN_URL}/usuarios/${eliminando.id}`, auth())
      setEliminando(null)
      setDetalle(null)
      setSuccess('Entidad eliminada correctamente.')
      await cargar()
    } catch (err) { setError(err.response?.data?.error || 'No se pudo eliminar la entidad.') }
  }

  return (
    <>
      <header><h1 className="text-xl font-bold text-foreground">Administración de entidades</h1><p className="mt-1 text-sm text-muted-foreground">Gestiona solicitudes, bloqueos y reactivaciones de organizaciones aliadas.</p></header>
      <ErrorBox text={error} />
      <SuccessBox text={success} />

      {/* Filtros consistentes con el resto del sistema */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => setVista(t.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${vista === t.value ? 'bg-navy text-white shadow-sm' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Table headers={['Entidad','Tipo','Servicios','Estado','Acciones']} empty="No hay entidades para este estado.">
        {filtradas.map(e => {
          const esPendiente = e.aprobacion_pendiente === 1 || e.estado_aprobacion === 'pendiente'
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
          onBloquear={() => { setBloqueando(detalle); setDetalle(null) }}
          onDesbloquear={() => desbloquear(detalle.id)}
          onEliminar={() => { setEliminando(detalle); setDetalle(null) }}
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
        <ConfirmDialog
          title="Bloquear entidad"
          message="¿Seguro que deseas bloquear esta entidad?"
          confirmText="Bloquear"
          onCancel={() => setBloqueando(null)}
          onConfirm={bloquear}
        />
      )}

      {eliminando && (
        <ConfirmDialog
          title="Eliminar entidad"
          message="¿Seguro que deseas eliminar esta entidad?"
          confirmText="Eliminar"
          onCancel={() => setEliminando(null)}
          onConfirm={eliminarEntidad}
        />
      )}
    </>
  )
}

function TabModeracion() {
  const [data, setData] = useState({ sinEntidad: [], reportados: [] })
  const [vista, setVista] = useState('sinEntidad')
  const [selected, setSelected] = useState(null)
  const [assigning, setAssigning] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [entidades, setEntidades] = useState([])
  const [entidadId, setEntidadId] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState('')

  const cargar = async () => {
    setError('')
    try {
      const [{ data: invalidos }, { data: sinEntidad }] = await Promise.all([
        axios.get(API_ADMIN_URL + '/reportes-invalidos', auth()),
        axios.get(API_ADMIN_URL + '/reportes-sin-entidad', auth()),
      ])
      setData({
        sinEntidad: (sinEntidad || []).map(r => ({ ...r, origenTipo: 'sinEntidad' })),
        reportados: (invalidos || []).map(r => ({ ...r, origenTipo: 'reportado' })),
      })
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los reportes de moderacion.')
    }
  }

  useEffect(() => { cargar() }, [])

  const tabs = [
    { value: 'sinEntidad', label: 'Sin entidad', count: data.sinEntidad.length },
    { value: 'reportados', label: 'Reportados por entidad', count: data.reportados.length },
  ]
  const rows = vista === 'sinEntidad' ? data.sinEntidad : data.reportados
  const esReporteMarcado = selected?.origenTipo === 'reportado'
  const estadoModeracion = {
    pendiente: 'Pendiente',
    requiere_revision: 'Revisión administrativa',
    en_atencion: 'En atención',
    rescatado: 'Rescatado',
  }

  const openAssign = async (reporte) => {
    setAssigning(reporte)
    setSelected(null)
    setEntidadId('')
    setNota('')
    setError('')
    try {
      const { data: entidadesCompatibles } = await axios.get(API_ADMIN_URL + '/entidades?categoria=' + encodeURIComponent(reporte.categoria || ''), auth())
      setEntidades(entidadesCompatibles || [])
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar entidades compatibles.')
    }
  }

  const asignar = async () => {
    if (!assigning || !entidadId) return
    setError('')
    try {
      await axios.patch(API_ADMIN_URL + '/reportes/' + assigning.id + '/asignar', { entidad_id: entidadId, nota }, auth())
      setAssigning(null)
      setSelected(null)
      await cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo asignar el reporte.')
    }
  }

  const eliminarReporte = async () => {
    if (!eliminando) return
    setError('')
    try {
      await axios.delete(API_ADMIN_URL + '/reportes/' + eliminando.id, auth())
      setData(prev => ({
        sinEntidad: prev.sinEntidad.filter(r => r.id !== eliminando.id),
        reportados: prev.reportados.filter(r => r.id !== eliminando.id),
      }))
      if (selected?.id === eliminando.id) setSelected(null)
      setEliminando(null)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el reporte.')
    }
  }

  const headers = vista === 'sinEntidad'
    ? ['Reporte', 'Categoría', 'Estado', 'Fecha', 'Acción']
    : ['Reporte', 'Categoría', 'Entidad', 'Motivo', 'Acción']

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Moderación</h1>
          <p className="mt-1 text-sm text-muted-foreground">Clasifica reportes sin entidad y casos enviados a revisión.</p>
        </div>
        <button onClick={cargar} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </button>
      </header>

      <ErrorBox text={error} />

      <div className="flex flex-wrap gap-1.5">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setVista(t.value)}
            className={'rounded-lg px-3 py-1.5 text-xs font-semibold transition ' + (vista === t.value ? 'bg-navy text-white shadow-sm' : 'bg-muted text-foreground hover:bg-muted/80')}
          >
            {t.label} <span className="ml-1 opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      <Table headers={headers} empty={vista === 'sinEntidad' ? 'No hay reportes pendientes de entidad.' : 'No hay reportes marcados por entidades.'}>
        {rows.map(r => (
          <tr key={r.id} className="hover:bg-muted/30">
            <td className="max-w-[360px] px-4 py-3">
              <p className="font-medium text-foreground">{r.especie}</p>
              <p className="truncate text-xs text-muted-foreground" title={r.descripcion}>{r.descripcion || 'Sin descripción registrada'}</p>
            </td>
            <td className="px-4 py-3 text-xs text-muted-foreground">{CATEGORIA_LABELS[r.categoria] || r.categoria || 'No registrada'}</td>
            {vista === 'sinEntidad' ? (
              <>
                <td className="px-4 py-3 text-xs text-muted-foreground">{estadoModeracion[r.estado] || 'Pendiente'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.fecha ? new Date(r.fecha).toLocaleDateString('es-CO') : 'No registrada'}</td>
              </>
            ) : (
              <>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.entidad_nombre || (r.entidad_asignada_id ? 'Entidad asignada' : 'Sin entidad')}</td>
                <td className="max-w-[260px] truncate px-4 py-3 text-xs text-muted-foreground" title={r.motivo_reporte || ''}>{r.motivo_reporte || 'Sin motivo registrado'}</td>
              </>
            )}
            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelected(r)} className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted">
                <Eye className="inline h-3.5 w-3.5" /> Ver
              </button>
            </td>
          </tr>
        ))}
      </Table>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-teal">{esReporteMarcado ? 'Reporte marcado por entidad' : 'Reporte sin entidad'}</p>
              <h3 className="text-base font-bold text-foreground">Detalle del reporte</h3>
              <p className="text-xs text-muted-foreground">{selected.especie}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar"><X className="h-5 w-5" /></button>
          </div>

          {selected.foto && (
            <div className="mb-4 overflow-hidden rounded-lg bg-muted">
              <img src={selected.foto} alt={selected.especie || 'Reporte'} className="h-48 w-full object-contain" />
            </div>
          )}

          <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-2">
            <Info label="Categoría" value={CATEGORIA_LABELS[selected.categoria] || selected.categoria} />
            <Info label="Estado" value={String(selected.estado || '').replace(/_/g, ' ')} />
            <Info label="Prioridad" value={selected.prioridad} />
            <Info label="Reportado por" value={selected.reportadoPor} />
            <div className="sm:col-span-2"><Info label="Descripción" value={selected.descripcion} /></div>
            <div className="sm:col-span-2"><Info label="Ubicación" value={selected.ubicacion} /></div>
            {esReporteMarcado && (
              <>
                <Info label="Entidad que reportó" value={selected.entidad_nombre || 'Entidad asignada'} />
                <Info label="Tipo de reporte" value={selected.tipo_reporte_invalido === 'no_corresponde' ? 'No corresponde a la entidad' : 'Posible falso'} />
                <div className="sm:col-span-2"><Info label="Motivo" value={selected.motivo_reporte} /></div>
              </>
            )}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button onClick={() => openAssign(selected)} className="rounded-lg bg-navy py-2 text-sm font-semibold text-white transition hover:opacity-90">
              <Building2 className="inline h-4 w-4" /> Asignar entidad
            </button>
            <button onClick={() => { setEliminando(selected); setSelected(null) }} className="rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
              <Trash2 className="inline h-4 w-4" /> Eliminar reporte
            </button>
          </div>
        </Modal>
      )}

      {assigning && (
        <Modal onClose={() => setAssigning(null)}>
          <h3 className="mb-2 text-base font-bold text-foreground">Asignar entidad</h3>
          <p className="mb-3 text-sm text-muted-foreground">Caso: {assigning.especie}. Solo se listan entidades compatibles con el tipo de reporte.</p>
          <select value={entidadId} onChange={e => setEntidadId(e.target.value)} className="mb-3 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring">
            <option value="">Selecciona entidad</option>
            {entidades.map(e => <option key={e.id} value={e.id}>{e.nombre_organizacion || e.nombre}</option>)}
          </select>
          <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3} placeholder="Nota opcional para entidad o ciudadano" className="mb-3 w-full resize-none rounded-lg border border-input bg-card p-2.5 text-sm outline-none focus:border-ring" />
          <div className="flex gap-2">
            <button onClick={() => setAssigning(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-semibold hover:bg-muted">Cancelar</button>
            <button onClick={asignar} disabled={!entidadId} className="flex-1 rounded-lg bg-navy py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">Asignar</button>
          </div>
        </Modal>
      )}

      {eliminando && (
        <ConfirmDialog
          title="Eliminar reporte"
          message="¿Seguro que deseas eliminar este reporte?"
          confirmText="Eliminar"
          onCancel={() => setEliminando(null)}
          onConfirm={eliminarReporte}
        />
      )}
    </>
  )
}

function Table({ headers, children, empty }) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children
  const hasRows = Array.isArray(rows) ? rows.length > 0 : Boolean(rows)
  return <div className="overflow-x-auto rounded-lg border border-border bg-card"><table className="w-full min-w-[760px] text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr>{headers.map(h => <th key={h} className={`px-4 py-3 font-semibold ${h.toLowerCase().startsWith('acci') ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead><tbody className="divide-y divide-border">{hasRows ? rows : <tr><td colSpan={headers.length} className="px-4 py-10 text-center text-sm text-muted-foreground">{empty}</td></tr>}</tbody></table></div>
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

function ConfirmDialog({ title, message, confirmText = 'Confirmar', onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="w-full max-w-[380px] rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="rounded-lg border border-border bg-card py-2 text-sm font-semibold transition hover:bg-muted">Cancelar</button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

/* ── MODAL ENTIDAD — ahora con secciones claras ─────────────── */
function EntidadModal({ entidad, onClose, onAprobar, onRechazar, onBloquear, onDesbloquear, onEliminar }) {
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
          <Info label="Aprobación pendiente" value={esPendiente ? 'Sí' : 'No'} />
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
        <button onClick={onEliminar} className="rounded-lg border border-red-200 bg-white py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 sm:col-span-2">
          <Trash2 className="inline h-4 w-4" /> Eliminar entidad
        </button>
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
