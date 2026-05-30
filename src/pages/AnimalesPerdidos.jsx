import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { obtenerMascotasPerdidas, publicarMascotaPerdida, marcarEncontrada, cerrarMascotaPerdida } from '@/services/reportes.service'
import { useAuth } from '@/context/AuthContext'
import {
  AlertTriangle, MapPin, Calendar, Plus, CheckCircle2, X, Phone,
  Filter, ChevronDown, AlertCircle, Camera, Lock, Eye, PawPrint,
  Home, Search, Share2, ArrowLeft, RotateCcw,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const SPECIES = ['Todas', 'Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro']
const ESTADOS = [
  { value: 'perdido', label: 'Perdidas activas' },
  { value: 'encontrado', label: 'Encontradas' },
  { value: 'cerrada', label: 'Cerradas' },
]
const LIMIT = 12
const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const ESTADO_BADGE = {
  perdido:    'bg-amber-100 text-amber-800 border-amber-200',
  encontrado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cerrada:    'bg-slate-100 text-slate-700 border-slate-200',
}
const ESTADO_LABEL = { perdido: 'Perdida', encontrado: 'Encontrada', cerrada: 'Cerrada' }

const normalizarTel = (tel) => {
  const str = String(tel || '').trim()
  if (/[a-zA-Z]/.test(str)) return { valido: false, error: 'El teléfono no puede contener letras.' }
  const digitos = str.replace(/[^0-9]/g, '')
  if (digitos.length !== 10) return { valido: false, error: 'El celular colombiano debe tener 10 dígitos.' }
  if (!digitos.startsWith('3')) return { valido: false, error: 'El celular colombiano debe iniciar con 3.' }
  return { valido: true, normalizado: digitos }
}

export default function AnimalesPerdidos() {
  const auth = useAuth()
  const location = useLocation()
  const user = auth?.user
  const esCiudadano = auth?.esCiudadano
  const isAuth = auth?.isAuthenticated
  const publicRoute = location.pathname === '/perdidos'

  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [species, setSpecies] = useState('Todas')
  const [estado, setEstado] = useState('perdido')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pagina: 1, totalPaginas: 1 })
  const [showModal, setShowModal] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [query])

  const cargar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await obtenerMascotasPerdidas({
        estado,
        page,
        limit: LIMIT,
        q: debouncedQuery || undefined,
        especie: species !== 'Todas' ? species : undefined,
      })
      const totalPaginas = Math.max(1, Number(data.totalPaginas || 1))
      setPets(data.mascotas || [])
      setPagination({
        total: Number(data.total || 0),
        pagina: Number(data.pagina || page),
        totalPaginas,
      })
      if (page > totalPaginas) setPage(totalPaginas)
    } catch {
      setError('No se pudieron cargar las mascotas. Verifica tu conexión.')
    } finally {
      setLoading(false)
    }
  }, [estado, species, debouncedQuery, page])

  useEffect(() => { cargar() }, [cargar])

  const limpiarFiltros = () => {
    setQuery('')
    setDebouncedQuery('')
    setSpecies('Todas')
    setEstado('perdido')
    setPage(1)
  }

  const sharePet = async (pet) => {
    const url = `${window.location.origin}/perdidos`
    const text = `Ayudemos a encontrar a ${pet.nombre} (${pet.especie}) en ${pet.zona}.`
    try {
      if (navigator.share) {
        await navigator.share({ title: `Mascota perdida: ${pet.nombre}`, text, url })
        return
      }
      await navigator.clipboard?.writeText(`${text} ${url}`)
      setToast('Enlace copiado para compartir.')
      window.setTimeout(() => setToast(''), 2600)
    } catch {
      setToast('No se pudo compartir en este momento.')
      window.setTimeout(() => setToast(''), 2600)
    }
  }

  const markFound = async (id) => {
    try { await marcarEncontrada(id); await cargar() }
    catch (err) { setError(err.response?.data?.message || 'No se pudo marcar como encontrada.') }
  }

  const closePet = async (id) => {
    try { await cerrarMascotaPerdida(id); await cargar() }
    catch (err) { setError(err.response?.data?.message || 'No se pudo cerrar la publicación.') }
  }

  return (
    <div className={publicRoute ? 'min-h-screen bg-background' : ''}>
      {publicRoute && <PublicNav />}

      <main className={publicRoute ? 'mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8' : 'mx-auto max-w-6xl space-y-5'}>
        {publicRoute ? (
          <PublicHero total={pagination.total} estado={estado} loading={loading} />
        ) : (
          <DashboardHeader total={pagination.total} esCiudadano={esCiudadano} onPublish={() => setShowModal(true)} />
        )}

        {toast && (
          <div className="mb-4 rounded-xl border border-teal/20 bg-teal/10 px-4 py-3 text-sm font-semibold text-teal">
            {toast}
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-destructive hover:opacity-70" aria-label="Cerrar alerta">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Filters
          query={query}
          setQuery={setQuery}
          estado={estado}
          setEstado={(v) => { setEstado(v); setPage(1) }}
          species={species}
          setSpecies={(v) => { setSpecies(v); setPage(1) }}
          onReset={limpiarFiltros}
        />

        {loading ? (
          <Skeleton />
        ) : pets.length === 0 ? (
          <EmptyState publicRoute={publicRoute} onReset={limpiarFiltros} />
        ) : (
          <>
            <div className={pets.length === 1
              ? 'mx-auto grid w-full max-w-sm grid-cols-1 gap-5'
              : 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3'}>
              {pets.map(p => (
                <PetCard key={p.id} pet={p} isAuth={isAuth} onOpen={() => setSelectedPet(p)} onShare={() => sharePet(p)} />
              ))}
            </div>
            <Pagination page={pagination.pagina} totalPages={pagination.totalPaginas} total={pagination.total} onPage={setPage} />
          </>
        )}

      </main>

      {selectedPet && (
        <DetalleMascota
          pet={selectedPet}
          isAuth={isAuth}
          esCiudadano={esCiudadano}
          user={user}
          onClose={() => setSelectedPet(null)}
          onShare={() => sharePet(selectedPet)}
          onFound={async (id) => { await markFound(id); setSelectedPet(null) }}
          onClosePet={async (id) => { await closePet(id); setSelectedPet(null) }}
        />
      )}

      {showModal && <ModalPublicar onClose={() => { setShowModal(false); cargar() }} />}
    </div>
  )
}

/* ── NAVBAR PÚBLICO MINIMAL — solo logo + Inicio + login + registro ── */
function PublicNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Volver al inicio">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal">
            <PawPrint className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Aria</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex">
            <Home className="h-4 w-4" /> Inicio
          </Link>
          <Link to="/login" className="inline-flex items-center rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:px-4">
            Iniciar sesión
          </Link>
          <Link to="/register" className="hidden items-center rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-light sm:inline-flex sm:px-4">
            Registrarse
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ── HERO PÚBLICO LIMPIO — sin tarjeta de stats, sin CTAs duplicados ── */
function PublicHero({ total, estado, loading }) {
  const labelEstado = ESTADOS.find(e => e.value === estado)?.label?.toLowerCase() || 'publicaciones'
  return (
    <section className="mb-6">
      <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
        <AlertTriangle className="h-3.5 w-3.5" /> Mascotas perdidas
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ayúdalas a volver a casa</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
        Consulta publicaciones activas, filtra por especie o zona y comparte el caso para aumentar la probabilidad de encontrar a la mascota.
      </p>
      {!loading && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {total} {total === 1 ? 'publicación' : 'publicaciones'} · {labelEstado}
        </p>
      )}
    </section>
  )
}

/* ── HEADER DASHBOARD (cuando entras logueado) ─────────────────────── */
function DashboardHeader({ total, esCiudadano, onPublish }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5" /> Mascotas perdidas
        </div>
        <h1 className="text-xl font-bold text-foreground">Ayúdalas a volver a casa</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{total} publicación{total !== 1 ? 'es' : ''} en esta sección.</p>
      </div>
      {esCiudadano && (
        <button onClick={onPublish} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Publicar mascota perdida
        </button>
      )}
    </header>
  )
}

/* ── FILTROS UNIFORMES (pills consistentes) ─────────────────────── */
function Filters({ query, setQuery, estado, setEstado, species, setSpecies, onReset }) {
  const hasFilters = query || estado !== 'perdido' || species !== 'Todas'
  return (
    <section className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, especie, zona o descripción"
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Estado
            </span>
            {ESTADOS.map(o => <Pill key={o.value} active={estado === o.value} onClick={() => setEstado(o.value)} variant="navy">{o.label}</Pill>)}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Especie</span>
            {SPECIES.map(o => <Pill key={o} active={species === o} onClick={() => setSpecies(o)} variant="teal">{o}</Pill>)}
          </div>

          {hasFilters && (
            <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted">
              <RotateCcw className="h-3.5 w-3.5" /> Limpiar
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Pill: filtro reutilizable y consistente ─────────────────────── */
function Pill({ active, onClick, children, variant = 'navy' }) {
  const activeCls = variant === 'teal' ? 'bg-teal text-white shadow-sm' : 'bg-navy text-white shadow-sm'
  return (
    <button onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${active ? activeCls : 'bg-muted text-foreground hover:bg-muted/80'}`}>
      {children}
    </button>
  )
}

/* ── TARJETA DE MASCOTA — referencia visual igual a reportes ──── */
function PetCard({ pet, isAuth, onOpen, onShare }) {
  const badgeCls = ESTADO_BADGE[pet.estado] || ESTADO_BADGE.perdido
  const badgeLabel = ESTADO_LABEL[pet.estado] || pet.estado
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-lg">
      {/* Imagen: SIN badge encima */}
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
        {pet.foto ? (
          <img
            src={pet.foto}
            alt={pet.nombre}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=70' }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PawPrint className="h-10 w-10" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-bold text-foreground" title={pet.nombre}>{pet.nombre}</h3>
          {pet.fecha && (
            <span className="flex-shrink-0 text-[11px] text-muted-foreground">
              {new Date(pet.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
            </span>
          )}
        </div>

        <p className="text-xs font-semibold text-teal">{pet.especie}</p>

        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${badgeCls}`}>
            {badgeLabel}
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{pet.descripcion}</p>

        <div className="space-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 flex-shrink-0 text-teal" /><span className="truncate">{pet.zona}</span></span>
          {!isAuth && (
            <span className="flex items-center gap-1.5 text-muted-foreground/80">
              <Lock className="h-3 w-3 flex-shrink-0" /> Inicia sesión para ver el contacto
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-2">
          <button onClick={onOpen} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted">
            <Eye className="h-3.5 w-3.5" /> Ver detalles
          </button>
          <button onClick={onShare} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label={`Compartir publicación de ${pet.nombre}`}>
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

/* ── MODAL DETALLE — tamaño similar al de reporte ──────────────── */
function DetalleMascota({ pet, isAuth, esCiudadano, user, onClose, onFound, onClosePet, onShare }) {
  const esDueno = esCiudadano && pet.usuario_id === user?.id
  const badgeCls = ESTADO_BADGE[pet.estado] || ESTADO_BADGE.perdido
  const badgeLabel = ESTADO_LABEL[pet.estado] || pet.estado

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl">

        {/* Header compacto */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-foreground" title={pet.nombre}>{pet.nombre}</h3>
            <p className="text-xs font-semibold text-teal">{pet.especie}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${badgeCls}`}>
                {badgeLabel}
              </span>
              {pet.fecha && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />{new Date(pet.fecha).toLocaleDateString('es-CO')}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Imagen con altura controlada */}
        {pet.foto && (
          <div className="mb-3 overflow-hidden rounded-lg bg-muted">
            <img src={pet.foto} alt={pet.nombre} className="h-56 w-full object-contain" />
          </div>
        )}

        {/* Descripción */}
        <p className="mb-3 text-sm leading-relaxed text-foreground">{pet.descripcion}</p>

        {/* Zona */}
        <div className="mb-3 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
          <span>{pet.zona}</span>
        </div>

        {/* Acciones */}
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Acciones</p>

          {/* Contacto */}
          {isAuth && pet.contacto ? (
            <a href={`tel:${pet.contacto}`} className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm font-bold text-teal transition hover:bg-teal/20">
              <Phone className="h-4 w-4" /> Llamar al contacto: {pet.contacto}
            </a>
          ) : (
            <Link to="/login" className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/80">
              <Lock className="h-4 w-4" /> Inicia sesión para ver el contacto
            </Link>
          )}

          {/* Botones */}
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={onShare} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
              <Share2 className="h-3.5 w-3.5" /> Compartir publicación
            </button>
            {esDueno && pet.estado === 'perdido' && (
              <button onClick={() => onFound(pet.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" /> Marcar como encontrada
              </button>
            )}
            {esDueno && pet.estado !== 'cerrada' && (
              <button onClick={() => onClosePet(pet.id)} className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted sm:col-span-2">
                Cerrar publicación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Paginación ────────────────────────────────────────────────── */
function Pagination({ page, totalPages, total, onPage }) {
  if (totalPages <= 1) return null
  const go = (next) => onPage(Math.min(Math.max(1, next), totalPages))
  return (
    <nav className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm sm:flex-row" aria-label="Paginación">
      <p className="text-muted-foreground">
        Página <span className="font-bold text-foreground">{page}</span> de <span className="font-bold text-foreground">{totalPages}</span> · {total} resultado{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => go(page - 1)} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <button onClick={() => go(page + 1)} disabled={page >= totalPages} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
          Siguiente <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}

function Skeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="aspect-[16/9] animate-pulse bg-muted" />
          <div className="space-y-3 p-3">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ publicRoute, onReset }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center shadow-sm">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <h3 className="text-base font-bold text-foreground">No hay publicaciones con estos filtros</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Prueba con otra especie, otro estado o limpia la búsqueda.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90">
          <RotateCcw className="h-3.5 w-3.5" /> Limpiar filtros
        </button>
        {publicRoute && (
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
            <Home className="h-3.5 w-3.5" /> Volver al inicio
          </Link>
        )}
      </div>
    </div>
  )
}

/* ── MODAL PUBLICAR ────────────────────────────────────────────── */
function ModalPublicar({ onClose }) {
  const ESPECIES_MODAL = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro']
  const [form, setForm] = useState({ nombre: '', especie: '', descripcion: '', zona: '', contacto: '' })
  const [fotoFile, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fotoError, setFotoError] = useState('')
  const [telError, setTelError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => {
    const value = k === 'contacto' ? String(e.target.value || '').replace(/\D/g, '').slice(0, 10) : e.target.value
    setForm(f => ({ ...f, [k]: value }))
    if (k === 'contacto') setTelError('')
  }

  const onFoto = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFotoError('')
    if (!ALLOWED_TYPES.includes(f.type)) { setFotoError('Solo JPG, PNG o WebP.'); return }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) { setFotoError(`Máximo ${MAX_SIZE_MB}MB.`); return }
    setFoto(f); setPreview(URL.createObjectURL(f))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setFotoError(''); setTelError('')
    if (!fotoFile) { setFotoError('Debes subir una foto de tu mascota.'); return }
    if (!form.nombre || !form.especie || !form.zona || !form.contacto) { setError('Completa todos los campos obligatorios.'); return }
    if (form.descripcion.trim().length < 20) { setError('La descripción debe tener al menos 20 caracteres.'); return }
    const telResult = normalizarTel(form.contacto)
    if (!telResult.valido) { setTelError(telResult.error); return }
    setLoading(true)
    try {
      await publicarMascotaPerdida({ ...form, contacto: telResult.normalizado, fotoFile })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">Publicar mascota perdida</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Incluye foto clara y datos suficientes.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>

        {error && <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Foto de la mascota *</label>
            <label className={`flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition ${fotoError ? 'border-destructive bg-destructive/5' : 'border-border bg-muted/40 hover:border-ring hover:bg-muted'}`}>
              {preview ? (
                <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
              ) : (
                <div className="p-3 text-center">
                  <Camera className={`mx-auto h-7 w-7 ${fotoError ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <p className="mt-1.5 text-xs font-semibold text-muted-foreground">Subir foto</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">JPG, PNG o WebP. Máx {MAX_SIZE_MB}MB.</p>
                </div>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFoto} />
            </label>
            {fotoError && <p className="mt-1 text-xs text-destructive">{fotoError}</p>}
          </div>

          {[{ label: 'Nombre de la mascota *', key: 'nombre', placeholder: 'Nombre de tu mascota' }, { label: 'Zona donde se perdió *', key: 'zona', placeholder: 'Ej: Barrio Centro, Calle 10' }].map(f => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">{f.label}</span>
              <input value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25" />
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">Teléfono de contacto *</span>
            <input value={form.contacto} onChange={set('contacto')} placeholder="Ej: 3226671461" inputMode="numeric" maxLength={10} className={`w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/25 ${telError ? 'border-destructive' : 'border-input focus:border-ring'}`} />
            {telError && <p className="mt-1 text-xs text-destructive">{telError}</p>}
            <p className="mt-0.5 text-[11px] text-muted-foreground">Ingresa un número válido de 10 dígitos, sin espacios ni indicativos.</p>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">Especie *</span>
            <div className="relative">
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select value={form.especie} onChange={set('especie')} className="w-full appearance-none rounded-lg border border-input bg-card px-3 py-2 pr-9 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25">
                <option value="">Selecciona la especie</option>
                {ESPECIES_MODAL.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">Descripción * ({form.descripcion.length}/20 mín.)</span>
            <textarea value={form.descripcion} onChange={set('descripcion')} rows={3} placeholder="Color, tamaño, collar, señas particulares..." className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25" />
          </label>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border bg-card py-2 text-sm font-semibold transition hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-navy py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">{loading ? 'Publicando...' : 'Publicar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
