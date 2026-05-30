import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '@/services/auth.service'
import {
  PawPrint, User, Mail, Lock, ArrowRight, Building2,
  Phone, MapPin, Hash, Globe, ChevronDown, UserCheck, ArrowLeft
} from 'lucide-react'

const TIPOS_ENTIDAD = [
  { value: 'veterinaria',          label: 'Veterinaria' },
  { value: 'fundacion',            label: 'Fundación' },
  { value: 'autoridad_ambiental',  label: 'Autoridad Ambiental' },
  { value: 'rescatista_organizado',label: 'Rescatista Organizado' },
  { value: 'hogar_temporal',       label: 'Hogar Temporal' },
  { value: 'otra',                 label: 'Otra' },
]

const SERVICIOS = [
  { value: 'rescate_calle',         label: 'Rescate de animales en calle' },
  { value: 'atencion_veterinaria',  label: 'Atención veterinaria' },
  { value: 'hogar_temporal',        label: 'Hogar temporal' },
  { value: 'maltrato',              label: 'Casos de maltrato' },
  { value: 'cautiverio',            label: 'Casos de cautiverio' },
  { value: 'fauna_silvestre',       label: 'Fauna silvestre' },
  { value: 'adopcion_seguimiento',  label: 'Adopción y seguimiento' },
]

const SERVICIOS_VALIDOS = SERVICIOS.map(s => s.value)
const onlyDigits = (value) => String(value || '').replace(/\D/g, '')
const limitDigits = (value, max = 15) => onlyDigits(value).slice(0, max)
const isValidUrl = (value) => !value || /^https?:\/\/.+\..+/.test(String(value).trim())
const normalizarTelefono = (value) => onlyDigits(value)

function validarEntidad(form) {
  const nit = onlyDigits(form.nit)
  const telefono = normalizarTelefono(form.telefono_oficial)
  const servicios = Array.isArray(form.servicios_ofrecidos) ? form.servicios_ofrecidos : []

  if (!nit) return 'El NIT es requerido.'
  if (nit.length < 9 || nit.length > 10) return 'El NIT debe tener 9 dígitos, o 10 si incluye dígito de verificación.'
  if (!form.nombre_organizacion.trim()) return 'El nombre de la organización es requerido.'
  if (form.nombre_organizacion.trim().length < 3 || form.nombre_organizacion.trim().length > 100) return 'El nombre de la organización debe tener entre 3 y 100 caracteres.'
  if (!form.tipo_entidad || !TIPOS_ENTIDAD.some(t => t.value === form.tipo_entidad)) return 'Selecciona un tipo de entidad válido.'
  if (!telefono) return 'El teléfono oficial es requerido.'
  if (telefono.length !== 10) return 'El teléfono oficial colombiano debe tener 10 dígitos.'
  if (!form.ciudad.trim()) return 'La ciudad es requerida.'
  if (form.ciudad.trim().length < 2 || form.ciudad.trim().length > 100) return 'La ciudad debe tener entre 2 y 100 caracteres.'
  if (!form.representante.trim()) return 'El nombre del representante es requerido.'
  if (form.representante.trim().length < 3 || form.representante.trim().length > 100) return 'El representante debe tener entre 3 y 100 caracteres.'
  if (!form.descripcion_entidad.trim() || form.descripcion_entidad.trim().length < 20) return 'La descripción debe tener al menos 20 caracteres.'
  if (form.descripcion_entidad.trim().length > 800) return 'La descripción debe tener máximo 800 caracteres.'
  if (form.direccion_sede.trim().length > 200) return 'La dirección de sede debe tener máximo 200 caracteres.'
  if (form.enlace_verificacion.trim().length > 255) return 'El sitio web debe tener máximo 255 caracteres.'
  if (!isValidUrl(form.enlace_verificacion.trim())) return 'El sitio web debe iniciar con http:// o https://.'
  if (servicios.length === 0 || servicios.some(s => !SERVICIOS_VALIDOS.includes(s))) return 'Selecciona al menos un servicio ofrecido válido.'
  return ''
}

export default function Register() {
  const navigate = useNavigate()
  const [rol, setRol]   = useState('ciudadano')
  const [form, setForm] = useState({
    nombre: '', email: '', contrasena: '',
    nit: '', nombre_organizacion: '', tipo_entidad: '',
    telefono_oficial: '', ciudad: '', representante: '',
    descripcion_entidad: '', direccion_sede: '', enlace_verificacion: '',
    servicios_ofrecidos: []
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const entityError = useMemo(() => rol === 'entidad' ? validarEntidad(form) : '', [rol, form])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const setLimitedDigits = (key, max = 15) => (value) => {
    setForm(f => ({ ...f, [key]: limitDigits(value, max) }))
  }

  const handleNIT = (e) => setLimitedDigits('nit', 10)(e.target.value)
  const handleTel = (e) => setLimitedDigits('telefono_oficial', 10)(e.target.value)

  const digitInputGuards = (key, max = 15) => ({
    onBeforeInput: (e) => {
      if (e.data && /\D/.test(e.data)) e.preventDefault()
      const current = onlyDigits(e.currentTarget.value)
      const selected = Math.max(0, (e.currentTarget.selectionEnd || 0) - (e.currentTarget.selectionStart || 0))
      if (e.data && current.length - selected + onlyDigits(e.data).length > max) e.preventDefault()
    },
    onInput: (e) => {
      const limpio = limitDigits(e.currentTarget.value, max)
      if (e.currentTarget.value !== limpio) e.currentTarget.value = limpio
      setLimitedDigits(key, max)(limpio)
    },
    onPaste: (e) => {
      e.preventDefault()
      const text = e.clipboardData.getData('text')
      const target = e.currentTarget
      const start = target.selectionStart || 0
      const end = target.selectionEnd || 0
      const next = `${target.value.slice(0, start)}${text}${target.value.slice(end)}`
      setLimitedDigits(key, max)(next)
    },
    onKeyDown: (e) => {
      const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
      if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return
      if (!/^\d$/.test(e.key)) e.preventDefault()
    },
  })

  const toggleServicio = (val) => {
    setForm(f => ({
      ...f,
      servicios_ofrecidos: f.servicios_ofrecidos.includes(val)
        ? f.servicios_ofrecidos.filter(s => s !== val)
        : [...f.servicios_ofrecidos, val]
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim() || form.nombre.trim().length < 2) return setError('El nombre debe tener al menos 2 caracteres.')
    if (!form.email.trim()) return setError('El correo electrónico es requerido.')
    if (!form.contrasena || form.contrasena.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (rol === 'entidad' && entityError) return setError(entityError)

    setLoading(true)
    try {
      await registerApi(
        form.nombre, form.email, form.contrasena, rol,
        rol === 'entidad' ? form.nit : null,
        rol === 'entidad' ? form.nombre_organizacion : null,
        rol === 'entidad' ? form.tipo_entidad : null,
        rol === 'entidad' ? normalizarTelefono(form.telefono_oficial) : null,
        rol === 'entidad' ? form.ciudad : null,
        rol === 'entidad' ? form.representante : null,
        rol === 'entidad' ? form.descripcion_entidad : null,
        rol === 'entidad' ? form.servicios_ofrecidos : null,
        rol === 'entidad' ? form.direccion_sede : null,
        rol === 'entidad' ? form.enlace_verificacion : null,
      )
      navigate('/verificar-codigo', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta. Intenta de nuevo.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white">
              <PawPrint className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-foreground">Aria</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>
        </div>

        <h1 className="text-xl font-bold text-foreground">Crear cuenta</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Únete a la red de rescate animal</p>

        {error && (
          <div className="mt-3 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
        )}

        <div className="mt-4 flex rounded-lg border border-border overflow-hidden">
          {[
            { value: 'ciudadano', label: 'Ciudadano',  icon: User },
            { value: 'entidad',   label: 'Entidad',    icon: Building2 },
          ].map(r => (
            <button key={r.value} type="button" onClick={() => { setRol(r.value); setError('') }}
              className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition ${
                rol === r.value ? 'bg-navy text-white' : 'bg-card text-muted-foreground hover:bg-muted'
              }`}>
              <r.icon className="h-4 w-4" />
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field icon={User} label="Nombre completo *" maxLength={100}
            value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre completo" />
          <Field icon={Mail} label="Correo electrónico *" maxLength={150}
            value={form.email} onChange={set('email')} type="email" placeholder="correo@ejemplo.com" />
          <Field icon={Lock} label="Contraseña *" maxLength={100}
            value={form.contrasena} onChange={set('contrasena')} type="password" placeholder="Mínimo 8 caracteres" />

          {rol === 'entidad' && (
            <div className="space-y-3 rounded-lg border border-teal/30 bg-teal/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-teal" />
                <p className="text-xs font-bold text-teal uppercase tracking-wide">Información de la entidad</p>
              </div>

              <Field icon={Building2} label="Nombre de la organización *" maxLength={100}
                value={form.nombre_organizacion} onChange={set('nombre_organizacion')}
                placeholder="Nombre oficial" />

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-foreground">NIT *</span>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={form.nit} onChange={handleNIT} {...digitInputGuards('nit', 10)} placeholder="Ej: 900123456" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10}
                    className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Ingresa el NIT de la entidad, sin puntos ni guiones. Puedes incluir el dígito de verificación.</p>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-foreground">Tipo de entidad *</span>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select value={form.tipo_entidad} onChange={set('tipo_entidad')}
                    className="w-full appearance-none rounded-lg border border-input bg-card py-2 pl-10 pr-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
                    <option value="">Selecciona el tipo</option>
                    {TIPOS_ENTIDAD.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-foreground">Teléfono oficial *</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input value={form.telefono_oficial} onChange={handleTel} {...digitInputGuards('telefono_oficial', 10)} placeholder="Ej: 3226671461" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10}
                    className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Ingresa un número válido de 10 dígitos, sin espacios ni indicativos.</p>
              </label>

              <Field icon={MapPin} label="Ciudad *" maxLength={100}
                value={form.ciudad} onChange={set('ciudad')} placeholder="Ciudad o municipio" />

              <Field icon={UserCheck} label="Nombre del representante *" maxLength={100}
                value={form.representante} onChange={set('representante')} placeholder="Nombre del responsable" />

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-foreground">
                  Descripción de la entidad * ({form.descripcion_entidad.length}/800 máx.)
                </span>
                <textarea value={form.descripcion_entidad} onChange={set('descripcion_entidad')}
                  rows={3} maxLength={800} placeholder="¿Qué hace tu entidad? ¿Cuál es su misión?"
                  className="w-full rounded-lg border border-input bg-card py-2 px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 resize-none" />
                <p className="mt-0.5 text-[11px] text-muted-foreground">Mínimo 20 caracteres.</p>
              </label>

              <div>
                <p className="mb-2 text-xs font-semibold text-foreground">Servicios ofrecidos * (selecciona al menos uno)</p>
                <div className="space-y-1.5">
                  {SERVICIOS.map(s => (
                    <label key={s.value} className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/50 transition">
                      <input type="checkbox"
                        checked={form.servicios_ofrecidos.includes(s.value)}
                        onChange={() => toggleServicio(s.value)}
                        className="h-4 w-4 rounded accent-teal" />
                      <span className="text-sm text-foreground">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Field icon={MapPin} label="Dirección de sede (opcional)" maxLength={200}
                value={form.direccion_sede} onChange={set('direccion_sede')}
                placeholder="Dirección física" />
              <Field icon={Globe} label="Sitio web (opcional)" maxLength={255}
                value={form.enlace_verificacion} onChange={set('enlace_verificacion')}
                placeholder="https://..." />

              {entityError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {entityError}
                </div>
              )}
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                La información será revisada por un administrador antes de habilitar tu entidad.
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || (rol === 'entidad' && Boolean(entityError))}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Creando cuenta...' : <><span>Crear cuenta</span><ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-navy hover:underline">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, type = 'text', value, onChange, placeholder, maxLength }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
          className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-3 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
      </div>
    </label>
  )
}
