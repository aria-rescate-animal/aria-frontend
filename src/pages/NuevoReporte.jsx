import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearReporte } from '@/services/reportes.service'
import { obtenerEntidadesDisponibles } from '@/services/auth.service'
import { CATEGORIA_LABELS, CATEGORIA_HELP, SERVICIOS_LABELS, PRIORIDAD_LABELS } from '@/lib/estados'
import {
  Camera, MapPin, FileText, Tag, CheckCircle2,
  AlertCircle, Bot, ChevronDown, Building2, AlertTriangle, LocateFixed, ClipboardCheck,
  RotateCcw
} from 'lucide-react'

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Caballo', 'Vaca', 'Reptil', 'Conejo', 'Otro']

const CATEGORIAS = [
  'abandono',
  'herido',
  'enfermo',
  'maltrato',
  'cautiverio',
  'fauna_silvestre',
  'no_estoy_seguro',
]

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const categoriaRequiereRevision = (categoria) => categoria === 'no_estoy_seguro'

const limpiarTexto = (value) => String(value || '').trim().replace(/\s+/g, ' ')

export default function NuevoReporte() {
  const navigate = useNavigate()
  const [species, setSpecies]         = useState('')
  const [desc, setDesc]               = useState('')
  const [sector, setSector]           = useState('')
  const [referencia, setReferencia]   = useState('')
  const [coords, setCoords]           = useState(null)
  const [locating, setLocating]       = useState(false)
  const [usandoManual, setUsandoManual] = useState(false) // true cuando hay GPS pero el usuario quiso volver al manual
  const [category, setCategory]       = useState('')
  const [prioridad, setPrioridad]     = useState('normal')
  const [photo, setPhoto]             = useState(null)
  const [fotoFile, setFotoFile]       = useState(null)
  const [fotoError, setFotoError]     = useState('')
  const [submitted, setSubmitted]     = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const [entidades, setEntidades]         = useState({ todas: [], sugeridas: [] })
  const [entidadId, setEntidadId]         = useState('')
  const [loadingEntidades, setLoadingEnt] = useState(false)

  const selectedCategory = category ? { value: category, label: CATEGORIA_LABELS[category], help: CATEGORIA_HELP[category] } : null
  const descError = desc.length > 0 && desc.trim().length < 20
  const referenciaError = referencia.length > 0 && referencia.trim().length < 8

  // ── Lógica GPS ──
  // - Si hay coords y NO está usando manual: sector se oculta y no es obligatorio
  // - Si hay coords pero el usuario activó manual: sector se muestra y es obligatorio
  // - Si NO hay coords: sector se muestra y es obligatorio
  const tieneGPS = Boolean(coords)
  const mostrarCampoSector = !tieneGPS || usandoManual
  const sectorObligatorio = mostrarCampoSector

  const ubicacionFinal = useMemo(() => {
    const zona = limpiarTexto(sector)
    const ref = limpiarTexto(referencia)
    if (tieneGPS && !usandoManual) {
      // Solo GPS + referencia
      return ref ? `Ubicación GPS capturada — Ref: ${ref}` : 'Ubicación GPS capturada'
    }
    if (!zona && !ref) return ''
    if (zona && ref) return `${zona} — Ref: ${ref}`
    return zona || `Ref: ${ref}`
  }, [sector, referencia, tieneGPS, usandoManual])

  useEffect(() => {
    setEntidadId('')
    setEntidades({ todas: [], sugeridas: [] })
    if (!category || categoriaRequiereRevision(category)) return

    setLoadingEnt(true)
    obtenerEntidadesDisponibles(category)
      .then(data => setEntidades({ todas: data?.todas || [], sugeridas: data?.sugeridas || [] }))
      .catch(() => setEntidades({ todas: [], sugeridas: [] }))
      .finally(() => setLoadingEnt(false))
  }, [category])

  const onPhoto = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFotoError('')
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFotoError('Solo se permiten imágenes JPG, PNG o WebP.')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFotoError(`La imagen no debe superar ${MAX_SIZE_MB}MB.`)
      return
    }
    setFotoFile(f)
    setPhoto(URL.createObjectURL(f))
  }

  const usarUbicacionActual = () => {
    setError('')
    if (!navigator.geolocation) {
      setError('Tu navegador no permite capturar GPS. Escribe la ubicación o sector y un punto de referencia claro.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        setCoords({ latitud: lat, longitud: lng })
        setUsandoManual(false)
        setSector('') // limpiamos el campo manual
        setLocating(false)
      },
      () => {
        setLocating(false)
        setError('No pudimos acceder al GPS. Escribe una ubicación o sector y un punto de referencia para que la entidad encuentre al animal.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const volverAManual = () => {
    setCoords(null)
    setUsandoManual(false)
  }

  const listaEntidades = entidades.sugeridas || []
  const tieneEntidadesCompatibles = listaEntidades.length > 0
  const esRevisionAdministrativa = category && (categoriaRequiereRevision(category) || !tieneEntidadesCompatibles)
  const requiereSeleccionEntidad = Boolean(category && !categoriaRequiereRevision(category) && tieneEntidadesCompatibles)

  // Validación de ubicación:
  // - Si hay GPS sin manual: solo referencia es obligatoria
  // - Si NO hay GPS o usa manual: sector + referencia son obligatorios
  const ubicacionValida = sectorObligatorio
    ? sector.trim().length >= 3 && referencia.trim().length >= 8
    : referencia.trim().length >= 8

  const puedeEnviar = fotoFile && species && category && ubicacionValida && desc.trim().length >= 20 && !fotoError && (!requiereSeleccionEntidad || entidadId)
  const entidadSeleccionada = listaEntidades.find(e => String(e.id) === String(entidadId))

  const submit = async (e) => {
    e.preventDefault()
    if (!fotoFile) return setFotoError('Debes subir una foto del animal para crear el reporte.')

    if (sectorObligatorio) {
      if (!sector.trim()) return setError('La ubicación o sector es obligatorio.')
      if (sector.trim().length < 3) return setError('La ubicación o sector debe ser más clara.')
    }
    if (!referencia.trim() || referencia.trim().length < 8) return setError('Agrega un punto de referencia claro para que la entidad encuentre al animal.')
    if (requiereSeleccionEntidad && !entidadId) return setError('Selecciona una entidad compatible para enviar el reporte.')
    if (!puedeEnviar) return setError('Completa todos los campos obligatorios antes de enviar.')

    setError('')
    setLoading(true)
    try {
      await crearReporte({
        especie: species,
        descripcion: desc.trim(),
        ubicacion: ubicacionFinal,
        latitud: coords?.latitud ?? null,
        longitud: coords?.longitud ?? null,
        categoria: category,
        prioridad,
        entidad_asignada_id: esRevisionAdministrativa ? null : entidadId,
        fotoFile,
      })
      setSubmitted(true)
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      if (err.response?.status === 400) setError(err.response.data?.message || 'La imagen o los datos del reporte no son válidos.')
      else if (err.response?.status === 503) setError('El servicio de verificación IA no está disponible. Intenta más tarde.')
      else if (err.response?.status === 403) setError('No tienes permiso para crear reportes.')
      else setError('Error al enviar el reporte. Verifica tu conexión y vuelve a intentarlo.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="mx-auto max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-10 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
      <h2 className="mt-3 text-xl font-bold text-foreground">¡Reporte enviado!</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {entidadSeleccionada?.nombre_organizacion
          ? `Enviado a ${entidadSeleccionada.nombre_organizacion}.`
          : 'Un administrador revisará el caso y lo asignará a una entidad adecuada.'}
      </p>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Nuevo reporte</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Guía a la entidad con foto, ubicación, referencia y una descripción clara.</p>
      </header>

      <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-teal/20 bg-teal/5 px-3 py-2.5">
        <Bot className="h-4 w-4 text-teal flex-shrink-0" />
        <p className="text-xs text-foreground/80">
          La foto será verificada por IA antes de guardar el reporte. Si la imagen no corresponde a un animal real, no se enviará.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm">
        <SectionTitle number="1" title="Información del animal" />

        <div>
          <label className="mb-1 block text-xs font-semibold text-foreground">
            Foto del animal *
            <span className="ml-1 text-muted-foreground font-normal">(JPG, PNG, WebP — máx {MAX_SIZE_MB}MB)</span>
          </label>
          <label className={`flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition ${
            fotoError ? 'border-destructive bg-destructive/5' : 'border-border bg-muted/40 hover:border-ring hover:bg-muted'
          }`}>
            {photo
              ? <img src={photo} alt="preview" className="h-full w-full object-cover" />
              : <div className="text-center p-4">
                  <Camera className={`mx-auto h-7 w-7 ${fotoError ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <span className="mt-1.5 block text-sm font-medium text-muted-foreground">Toca para subir foto</span>
                  <span className="text-xs text-muted-foreground">Obligatoria</span>
                </div>}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} className="hidden" />
          </label>
          {fotoError && <p className="mt-1 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> {fotoError}</p>}
        </div>

        <FormField label="Especie *">
          <SelectInput icon={Tag} value={species} onChange={e => setSpecies(e.target.value)}>
            <option value="">Selecciona la especie</option>
            {ESPECIES.map(e => <option key={e} value={e}>{e}</option>)}
          </SelectInput>
        </FormField>

        <FormField label={`Descripción * — ${desc.length} caracteres`} error={descError ? 'Mínimo 20 caracteres' : undefined}>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
              placeholder="Describe lo que observas: comportamiento, heridas, síntomas o situación del animal."
              className={`w-full rounded-lg border bg-card py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 ${descError ? 'border-destructive' : 'border-input focus:border-ring'}`} />
          </div>
        </FormField>

        <SectionTitle number="2" title="Ubicación para encontrarlo" />

        {/* ── Botón GPS ── */}
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={usarUbicacionActual} disabled={locating}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                  tieneGPS && !usandoManual
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-teal/30 bg-teal/10 text-teal hover:bg-teal/15'
                }`}>
                <LocateFixed className="h-3.5 w-3.5" />
                {locating ? 'Capturando GPS...' : tieneGPS && !usandoManual ? 'GPS capturado — actualizar' : 'Usar mi ubicación actual'}
              </button>
              {tieneGPS && !usandoManual && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> GPS agregado correctamente
                </span>
              )}
            </div>
            {tieneGPS && !usandoManual && (
              <button type="button" onClick={() => setUsandoManual(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition">
                <RotateCcw className="h-3 w-3" /> Usar ubicación manual
              </button>
            )}
            {tieneGPS && usandoManual && (
              <button type="button" onClick={volverAManual}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition">
                Quitar GPS
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {tieneGPS && !usandoManual
              ? 'Tu ubicación GPS reemplaza el sector escrito. Solo necesitas agregar un punto de referencia.'
              : 'Si usas GPS solo necesitarás el punto de referencia. Sin GPS, la ubicación o sector es obligatoria.'}
          </p>
        </div>

        {mostrarCampoSector && (
          <FormField label="Ubicación o sector *">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={sector} onChange={e => setSector(e.target.value)} maxLength={120}
                placeholder="Ej: Barrio Centro, vereda La Esperanza, parque principal"
                className="w-full rounded-lg border border-input bg-card py-2 pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
            </div>
          </FormField>
        )}

        <FormField label="Punto de referencia *" error={referenciaError ? 'Agrega una referencia más clara.' : undefined}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={referencia} onChange={e => setReferencia(e.target.value)} maxLength={160}
              placeholder="Ej: Frente al colegio San José, junto a la tienda azul"
              className={`w-full rounded-lg border bg-card py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 ${referenciaError ? 'border-destructive' : 'border-input focus:border-ring'}`} />
          </div>
        </FormField>

        <SectionTitle number="3" title="Situación del animal" />

        <FormField label="¿Qué está pasando? *">
          <SelectInput icon={Tag} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Selecciona el tipo de caso</option>
            {CATEGORIAS.map(value => <option key={value} value={value}>{CATEGORIA_LABELS[value]}</option>)}
          </SelectInput>
          {selectedCategory?.help && (
            <div className="mt-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {selectedCategory.help}
            </div>
          )}
        </FormField>

        <FormField label="Prioridad">
          <SelectInput icon={AlertTriangle} value={prioridad} onChange={e => setPrioridad(e.target.value)}>
            <option value="normal">Normal — necesita atención, pero no parece crítico</option>
            <option value="urgente">Urgente — peligro inmediato o condición crítica</option>
          </SelectInput>
        </FormField>

        {category && (
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-start gap-2">
              <Building2 className="mt-0.5 h-4 w-4 text-navy" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Entidad destinataria</h3>
                <p className="mt-1 text-xs text-muted-foreground">ARIA solo muestra entidades aprobadas y compatibles con el tipo de caso.</p>
              </div>
            </div>

            {category === 'fauna_silvestre' && (
              <div className="mb-3 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>Este caso requiere entidades que atienden fauna silvestre. Si no hay disponibles, pasará a revisión administrativa.</span>
              </div>
            )}

            {category === 'no_estoy_seguro' ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">El caso será revisado por un administrador.</p>
                <p className="mt-1 text-xs">Como no estás seguro del tipo de caso, un administrador lo clasificará y lo asignará a una entidad adecuada.</p>
              </div>
            ) : loadingEntidades ? (
              <p className="text-sm text-muted-foreground">Buscando entidades compatibles...</p>
            ) : tieneEntidadesCompatibles ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entidades compatibles</p>
                {listaEntidades.map(ent => {
                  const selected = String(entidadId) === String(ent.id)
                  return (
                    <label key={ent.id} className={`block cursor-pointer rounded-lg border p-3 transition ${selected ? 'border-navy bg-navy/5' : 'border-border bg-card hover:border-teal/40'}`}>
                      <div className="flex items-start gap-2">
                        <input type="radio" name="entidad" value={ent.id} checked={selected} onChange={() => setEntidadId(String(ent.id))} className="mt-1 accent-navy" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{ent.nombre_organizacion || ent.nombre}</p>
                          <p className="text-xs text-muted-foreground capitalize">{(ent.tipo_entidad || '').replace(/_/g, ' ')}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{(ent.servicios || []).map(s => SERVICIOS_LABELS[s] || s).join(' · ')}</p>
                          {ent.ciudad && <p className="mt-1 text-xs text-muted-foreground">{ent.ciudad}</p>}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">No hay entidades compatibles disponibles para este tipo de caso.</p>
                <p className="mt-1 text-xs">Puedes enviar el reporte a revisión para que un administrador lo asigne manualmente.</p>
              </div>
            )}
          </div>
        )}

        <ResumenReporte
          species={species}
          category={category}
          prioridad={prioridad}
          sector={tieneGPS && !usandoManual ? 'GPS capturado' : sector}
          referencia={referencia}
          coords={coords}
          usandoManual={usandoManual}
          entidad={entidadSeleccionada}
          revision={Boolean(esRevisionAdministrativa)}
        />

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate(-1)} className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted transition">Cancelar</button>
          <button type="submit" disabled={loading || !puedeEnviar}
            className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Enviando...' : esRevisionAdministrativa ? 'Enviar a revisión administrativa' : 'Enviar reporte a la entidad'}
          </button>
        </div>
      </form>
    </div>
  )
}

function SectionTitle({ number, title }) {
  return (
    <div className="flex items-center gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{number}</span>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
    </div>
  )
}

function ResumenReporte({ species, category, prioridad, sector, referencia, coords, usandoManual, entidad, revision }) {
  if (!species && !category && !sector && !referencia && !entidad) return null
  const usaGPS = coords && !usandoManual
  return (
    <div className="rounded-lg border border-teal/20 bg-teal/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-teal" />
        <h3 className="text-sm font-bold text-foreground">Resumen antes de enviar</h3>
      </div>
      <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <Item label="Animal" value={species || 'Pendiente'} />
        <Item label="Caso" value={category ? CATEGORIA_LABELS[category] : 'Pendiente'} />
        <Item label="Prioridad" value={PRIORIDAD_LABELS[prioridad] || prioridad} />
        <Item label="Ubicación" value={usaGPS ? 'GPS capturado' : (sector || 'Pendiente')} />
        <Item label="Referencia" value={referencia || 'Pendiente'} />
        <Item label="GPS" value={coords ? (usandoManual ? 'Capturado pero usando manual' : 'Activo') : 'No agregado'} />
        <Item label="Destino" value={revision ? 'Revisión administrativa' : (entidad?.nombre_organizacion || 'Pendiente')} />
      </dl>
    </div>
  )
}

function Item({ label, value }) {
  return <div><dt className="font-semibold text-foreground">{label}</dt><dd className="break-words">{value}</dd></div>
}

function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  )
}

function SelectInput({ icon: Icon, children, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <select {...props}
        className="w-full appearance-none rounded-lg border border-input bg-card py-2 pl-10 pr-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30">
        {children}
      </select>
    </div>
  )
}
