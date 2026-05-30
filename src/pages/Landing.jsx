import { Link } from 'react-router-dom'
import {
  PawPrint, Heart, Building2, FileText,
  ArrowRight, ShieldCheck, Bell, EyeOff, ClipboardCheck, MapPinned
} from 'lucide-react'

const steps = [
  { number: '01', icon: FileText,  title: 'Reporta el caso',           description: 'El ciudadano registra la foto, la ubicación, la categoría y una descripción clara del animal.' },
  { number: '02', icon: Building2, title: 'Asigna una entidad',         description: 'ARIA permite seleccionar una entidad aprobada y compatible con el tipo de atención requerida.' },
  { number: '03', icon: Heart,     title: 'Recibe seguimiento',         description: 'La entidad actualiza el estado del caso y deja notas para que el reportante conozca el avance.' },
]

const capabilities = [
  {
    icon: ShieldCheck,
    title: 'Validación antes de guardar',
    text: 'Cada reporte exige imagen y datos mínimos. La validación con IA ayuda a reducir registros que no correspondan a animales reales.',
    badge: 'Validación IA',
  },
  {
    icon: Building2,
    title: 'Entidad compatible',
    text: 'El ciudadano selecciona una entidad aprobada según el tipo de caso, evitando que todos los reportes lleguen sin filtro a todas las entidades.',
    badge: 'Servicios ofrecidos',
  },
  {
    icon: Bell,
    title: 'Seguimiento visible',
    text: 'La entidad puede asumir el caso, cambiar el estado y agregar una nota para mantener informado al ciudadano.',
    badge: 'Notificaciones',
  },
  {
    icon: EyeOff,
    title: 'Privacidad del caso',
    text: 'Los casos rescatados pueden mostrarse sin exponer ubicación sensible ni datos privados del reportante.',
    badge: 'Datos protegidos',
  },
]

const summary = [
  { icon: ShieldCheck, label: 'Imagen obligatoria', text: 'La evidencia visual evita reportes incompletos.' },
  { icon: ClipboardCheck, label: 'Estados claros', text: 'Pendiente, en atención, rescatado o revisión.' },
  { icon: MapPinned, label: 'Ubicación útil', text: 'Sector y referencia para facilitar la atención.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-navy/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio de ARIA">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal">
              <PawPrint className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Aria</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/perdidos"
              className="inline-flex rounded-lg px-2 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:px-3 sm:text-sm"
            >
              <span className="sm:hidden">Perdidas</span><span className="hidden sm:inline">Mascotas perdidas</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:px-4"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-light sm:px-4"
            >
              Regístrate gratis
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-teal-dark">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-up relative mb-6 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                <span className="shimmer absolute inset-0 rounded-full" />
                <Heart className="relative z-10 h-4 w-4 text-teal-light" />
                <span className="relative z-10 text-sm font-medium text-white/90">
                  Plataforma de rescate y seguimiento animal
                </span>
              </div>

              <h1 className="animate-fade-in-up-delay-1 mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Cada reporte{' '}
                <span className="text-teal-light">necesita seguimiento.</span>
              </h1>

              <p className="animate-fade-in-up-delay-2 mx-auto mb-8 max-w-2xl text-lg leading-8 text-white/70 lg:mx-0">
                ARIA conecta ciudadanos con entidades aprobadas para registrar casos, asignarlos de forma responsable y mantener informado al reportante durante todo el proceso.
              </p>

              <div className="animate-fade-in-up-delay-3 grid gap-3 sm:grid-cols-3">
                {summary.map(item => (
                  <article key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left shadow-lg shadow-black/5 backdrop-blur-md">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal/20">
                      <item.icon className="h-5 w-5 text-teal-light" />
                    </div>
                    <h2 className="text-sm font-bold text-white">{item.label}</h2>
                    <p className="mt-1 text-xs leading-5 text-white/70">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative mx-auto max-w-md">
                <div className="group relative overflow-hidden rounded-3xl shadow-2xl ring-2 ring-white/10 transition-transform duration-300 hover:scale-[1.03]">
                  <img
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop&crop=faces"
                    alt="Animal fotografiado para reporte"
                    className="h-80 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                </div>

                <div className="group absolute -bottom-8 -left-8 overflow-hidden rounded-3xl shadow-2xl ring-2 ring-white/10 transition-transform duration-300 hover:scale-[1.03]">
                  <img
                    src="https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=500&fit=crop&crop=center"
                    alt="Mascota fotografiada"
                    className="h-48 w-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                </div>

                <div className="absolute -bottom-4 right-0 z-10 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/20">
                      <ShieldCheck className="h-5 w-5 text-teal-light" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Reportes con control</p>
                      <p className="text-xs text-white/70">IA, entidad y seguimiento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              ¿Cómo funciona?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              El flujo mantiene separado el reporte, la entidad responsable y el seguimiento del caso.
            </p>
          </div>

          <div className="relative grid items-stretch gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex h-full flex-col items-center">
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-16 z-10 hidden translate-x-1/2 md:block">
                    <ArrowRight className="h-6 w-6 text-teal" />
                  </div>
                )}
                <div className="group relative flex h-full min-h-[245px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-teal/30 hover:shadow-lg">
                  <span className="absolute -right-4 -top-4 select-none text-8xl font-bold text-muted/30 transition-colors duration-300 group-hover:text-teal/20">
                    {step.number}
                  </span>
                  <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10 transition-colors duration-300 group-hover:bg-teal/20">
                    <step.icon className="h-7 w-7 text-teal" />
                  </div>
                  <div className="relative flex flex-1 flex-col">
                    <span className="mb-2 block text-sm font-semibold text-teal">Paso {step.number}</span>
                    <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="flex-1 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Gestión responsable de reportes
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Funciones clave para registrar casos, asignarlos a entidades y proteger la información sensible.
            </p>
          </div>

          <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(item => (
              <article
                key={item.title}
                className="group flex h-full min-h-[230px] flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 transition-colors group-hover:bg-teal/20">
                  <item.icon className="h-6 w-6 text-teal" />
                </div>
                <span className="mb-3 inline-flex w-fit rounded-full bg-teal/10 px-2.5 py-1 text-xs font-semibold text-teal">
                  {item.badge}
                </span>
                <h3 className="mb-3 text-lg font-bold text-foreground">{item.title}</h3>
                <p className="flex-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio de ARIA">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy">
                <PawPrint className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Aria</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/perdidos" className="transition hover:text-foreground">Mascotas perdidas</Link>
              <span>Reportes con asignación responsable</span>
              <span>Seguimiento por estado</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Aria. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
