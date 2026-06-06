import { CheckCircle2, Clock3, Home, MailCheck, PawPrint } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function EntidadPendiente() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleExit = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white shadow-sm">
          <PawPrint className="h-7 w-7" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
          <Clock3 className="h-4 w-4" />
          Pendiente de aprobación
        </div>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Estamos revisando tu entidad
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {user?.nombre ? (
            <>
              Hola, <strong className="text-foreground">{user.nombre}</strong>. Recibimos tu información y la estamos validando para activar la cuenta de la organización.
            </>
          ) : (
            'Recibimos tu información y la estamos validando para activar la cuenta de la organización.'
          )}
        </p>

        <div className="mx-auto mt-7 max-w-xl rounded-xl border border-border bg-muted/25 p-4 text-left">
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Qué sigue</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Información recibida
              </div>
              <p className="text-xs leading-relaxed text-emerald-900/75">
                No necesitas crear otra cuenta mientras se revisa la solicitud.
              </p>
            </div>

            <div className="rounded-xl border border-teal/20 bg-teal/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-teal">
                <MailCheck className="h-4 w-4" />
                Notificación del resultado
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Te avisaremos cuando la entidad sea aprobada o requiera ajustes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleExit}
          className="mx-auto mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </button>
      </section>
    </main>
  )
}
