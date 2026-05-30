import { Clock, Building2, PawPrint, Home } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function EntidadPendiente() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleExit = () => { logout(); navigate('/', { replace: true }) }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy text-white shadow-sm">
          <PawPrint className="h-8 w-8" />
        </div>

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Entidad pendiente de aprobación</h1>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Hola, <strong>{user?.nombre}</strong>. La información de tu entidad fue recibida correctamente
          y está siendo revisada por el equipo de administración de Aria.
        </p>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700 text-left space-y-2">
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>Cuando tu entidad sea aprobada, podrás recibir reportes, gestionar casos y operar en la plataforma.</p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>Recibirás una notificación por correo y en la plataforma cuando el proceso finalice.</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          La información será revisada antes de habilitar tu entidad. Si tienes dudas, contacta al administrador.
        </p>

        <button onClick={handleExit}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition">
          <Home className="h-4 w-4" />
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
