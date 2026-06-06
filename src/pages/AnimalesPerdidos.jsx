import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { obtenerMascotasPerdidas, publicarMascotaPerdida, marcarEncontrada, cerrarMascotaPerdida } from '@/services/reportes.service'
import { useAuth } from '@/context/AuthContext'
import {
  MapPin, Calendar, Plus, CheckCircle2, X, Phone,
  ChevronDown, AlertCircle, Camera, Lock, Eye, PawPrint,
  Home, Search, Share2, RotateCcw, Copy, Heart,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const SPECIES = ['Todas', 'Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro']
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
  const estado = 'perdido'
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pagina: 1, totalPaginas: 1 })
  const [showModal, setShowModal] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)
  const [toast, setToast] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)

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
    setPage(1)
  }

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
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
      showToast('Enlace copiado para compartir.')
    } catch {
      showToast('No se pudo compartir en este momento.')
    }
  }

  const copyContact = async (contacto) => {
    try {
      await navigator.clipboard?.writeText(contacto)
      showToast('Contacto copiado.')
    } catch {
      showToast('No se pudo copiar el contacto.')
    }
  }

  const markFound = async (id) => {
    setSelectedPet(null)
    setConfirmAction({
      title: 'Marcar como encontrada',
      message: '¿Seguro que esta mascota ya fue encontrada?',
      confirmText: 'Confirmar',
      onConfirm: async () => {
        try {
          await marcarEncontrada(id)
          await cargar()
          setSelectedPet(null)
          setConfirmAction(null)
          showToast('Publicación marcada como encontrada.')
        } catch (err) {
          setError(err.response?.data?.message || 'No se pudo marcar como encontrada.')
          setConfirmAction(null)
        }
      },
    })
  }

  const closePet = async (id) => {
    setSelectedPet(null)
    setConfirmAction({
      title: 'Cerrar publicación',
      message: '¿Seguro que deseas cerrar esta publicación?',
      confirmText: 'Cerrar',
      onConfirm: async () => {
        try {
          await cerrarMascotaPerdida(id)
          await cargar()
          setSelectedPet(null)
          setConfirmAction(null)
          showToast('Publicación cerrada correctamente.')
        } catch (err) {
          setError(err.response?.data?.message || 'No se pudo cerrar la publicación.')
          setConfirmAction(null)
        }
      },
    })
  }

  return (
    <div className={publicRoute ? 'min-h-screen bg-background' : ''}>
      {publicRoute && <PublicNav />}

      <main className={publicRoute ? 'mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8' : 'mx-auto max-w-6xl space-y-5'}>
        {publicRoute ? (
          <PublicHero total={pagination.total} loading={loading} />
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
          species={species}
          setSpecies={(v) => { setSpecies(v); setPage(1) }}
          onReset={limpiarFiltros}
          publicRoute={publicRoute}
        />

        {loading ? (
          <Skeleton />
        ) : pets.length === 0 ? (
          <EmptyState
            hasActiveFilters={Boolean(query || debouncedQuery || species !== 'Todas')}
            publicRoute={publicRoute}
            onReset={limpiarFiltros}
          />
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
          onCopyContact={() => copyContact(selectedPet.contacto)}
          onFound={markFound}
          onClosePet={closePet}
        />
      )}

      {showModal && <ModalPublicar onClose={() => { setShowModal(false); cargar() }} />}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  )
}

/* Navbar publico minimal */
function PublicNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Ir a la página principal de ARIA">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal">
            <PawPrint className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ARIA</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
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

/* Hero publico */
function PublicHero() {
  return (
    <section className="mb-5 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-white via-sky-50 to-teal/10 shadow-sm">
      <div className="grid min-h-[230px] items-center gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div>
          <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Encuentra mascotas perdidas cerca de ti
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            Busca por nombre, especie, zona o descripción y ayuda a que regresen a casa.
          </p>
        </div>

        <div className="relative hidden min-h-[170px] lg:block" aria-hidden="true">
          <div className="absolute bottom-8 left-10 h-14 w-72 rounded-[100%] bg-teal/10" />
          <div className="absolute bottom-7 right-6 h-20 w-56 rounded-[100%] bg-sky-200/35" />
          <div className="absolute bottom-10 left-20 h-20 w-5 rounded-t-sm bg-slate-200/70" />
          <div className="absolute bottom-10 left-32 h-28 w-7 rounded-t-sm bg-slate-200/80" />
          <div className="absolute bottom-10 left-44 h-16 w-6 rounded-t-sm bg-slate-200/70" />
          <div className="absolute bottom-10 right-28 h-24 w-8 rounded-t-sm bg-slate-200/80" />
          <div className="absolute right-14 top-4 h-8 w-16 rounded-full bg-white/80" />
          <div className="absolute right-4 top-10 h-5 w-10 rounded-full bg-white/70" />
          <div className="absolute left-5 top-10 h-5 w-10 rounded-full bg-white/70" />
          <div className="absolute left-0 top-16 h-3 w-6 rounded-full bg-white/60" />

          <div className="absolute left-1/2 top-0 z-10 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-teal text-white shadow-xl shadow-teal/20">
            <PawPrint className="h-10 w-10" />
          </div>
          <div className="absolute left-1/2 top-[78px] h-10 w-10 -translate-x-1/2 rotate-45 rounded-br-[2rem] bg-teal shadow-xl shadow-teal/20" />

          <Heart className="absolute right-32 top-14 h-4 w-4 text-teal/60" />
          <Heart className="absolute left-20 top-28 h-3 w-3 text-teal/45" />
          <Heart className="absolute right-2 top-24 h-3.5 w-3.5 text-teal/45" />
        </div>
      </div>
    </section>
  )
}
function DashboardHeader({ total, esCiudadano, onPublish }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-teal">Mascotas perdidas</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Ayúdalas a volver a casa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total === 1 ? '1 publicación activa.' : `${total} publicaciones activas.`}
        </p>
      </div>
      {esCiudadano && (
        <button onClick={onPublish} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Publicar mascota perdida
        </button>
      )}
    </header>
  )
}

/* Filtros */
function Filters({ query, setQuery, species, setSpecies, onReset, publicRoute = false }) {
  const hasFilters = query || species !== 'Todas'
  if (publicRoute) {
    return (
      <section className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="block">
            <span className="sr-only">Buscar mascota perdida</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar por nombre, especie o zona"
                className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <div className="max-w-full overflow-x-auto rounded-lg border border-border bg-card">
              <div className="flex min-w-max">
              {SPECIES.map(o => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setSpecies(o)}
                  className={`min-w-[72px] px-3 py-2.5 text-xs font-semibold transition ${
                    species === o
                      ? 'bg-navy text-white'
                      : 'bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {o}
                </button>
              ))}
              </div>
            </div>
            {hasFilters && (
              <button onClick={onReset} className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:bg-muted">
                <RotateCcw className="h-3.5 w-3.5" /> Restablecer
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

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
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Especie</span>
            {SPECIES.map(o => <Pill key={o} active={species === o} onClick={() => setSpecies(o)} variant="teal">{o}</Pill>)}
          </div>

          {hasFilters && (
            <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted">
              <RotateCcw className="h-3.5 w-3.5" /> Restablecer búsqueda
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* Pill reutilizable */
function Pill({ active, onClick, children, variant = 'navy' }) {
  const activeCls = variant === 'teal' ? 'bg-teal text-white shadow-sm' : 'bg-navy text-white shadow-sm'
  return (
    <button onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${active ? activeCls : 'bg-muted text-foreground hover:bg-muted/80'}`}>
      {children}
    </button>
  )
}

/* Tarjeta de mascota */
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
              <Lock className="h-3 w-3 flex-shrink-0" /> Contacto protegido hasta iniciar sesión
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

/* Modal detalle */
function DetalleMascota({ pet, isAuth, esCiudadano, user, onClose, onFound, onClosePet, onShare, onCopyContact }) {
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
            <div className="mb-2 grid gap-2 sm:grid-cols-[1fr_auto]">
              <a href={`tel:${pet.contacto}`} className="flex items-center justify-center gap-1.5 rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm font-bold text-teal transition hover:bg-teal/20">
                <Phone className="h-4 w-4" /> Llamar: {pet.contacto}
              </a>
              <button type="button" onClick={onCopyContact} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
                <Copy className="h-3.5 w-3.5" /> Copiar
              </button>
            </div>
          ) : (
            <Link to="/login" className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/80">
              <Lock className="h-4 w-4" /> Inicia sesión para ver el contacto de forma segura
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

/* Paginacion */
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

function EmptyState({ hasActiveFilters, publicRoute, onReset }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center shadow-sm">
      <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <h3 className="text-base font-bold text-foreground">
        {hasActiveFilters ? 'No encontramos coincidencias' : 'Aún no hay mascotas perdidas publicadas'}
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {hasActiveFilters
          ? `Ajusta el nombre, especie${publicRoute ? '' : ' o estado'} para ampliar los resultados.`
          : 'Cuando una persona publique una mascota perdida, aparecerá en esta sección.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {hasActiveFilters && (
          <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90">
            <RotateCcw className="h-3.5 w-3.5" /> Restablecer búsqueda
          </button>
        )}
      </div>
    </div>
  )
}

/* Modal publicar */
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

function ConfirmDialog({ title, message, confirmText = 'Confirmar', onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="w-full max-w-[380px] rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-border bg-card py-2 text-sm font-semibold transition hover:bg-muted">Cancelar</button>
          <button type="button" onClick={onConfirm} className="rounded-lg bg-navy py-2 text-sm font-semibold text-white transition hover:opacity-90">{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

