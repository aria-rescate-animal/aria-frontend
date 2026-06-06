import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PawPrint } from 'lucide-react'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    const token        = params.get('token')
    const userStr      = params.get('user')
    const errorParam   = params.get('error')
    const mensaje      = params.get('mensaje')
    const pendiente    = params.get('pendienteAprobacion') === '1'

    if (errorParam === 'link_invalido') {
      navigate('/login?error=link_invalido', { replace: true })
      return
    }
    if (errorParam === 'link_expirado') {
      navigate('/login?error=link_expirado', { replace: true })
      return
    }
    if (mensaje === 'verificado_pendiente') {
      navigate('/login', {
        replace: true,
        state: { mensaje: 'Correo verificado. Tu cuenta será revisada por un administrador.' }
      })
      return
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        login(token, user, { pendienteAprobacion: pendiente })

        if (pendiente) {
          navigate('/pendiente-aprobacion', { replace: true })
        } else if (user.rol === 'administrador') {
          navigate('/admin', { replace: true })
        } else if (user.rol === 'entidad') {
          navigate('/reportes', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      } catch {
        setError('Error al procesar la sesión.')
        setTimeout(() => navigate('/login?error=google', { replace: true }), 1500)
      }
    } else {
      navigate('/login', { replace: true })
    }
  }, [login, navigate, params])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
          <PawPrint className="h-6 w-6" />
        </div>
        {error ? (
          <p className="text-sm font-semibold text-destructive">{error}</p>
        ) : (
          <>
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-3 border-muted border-t-teal" />
            <p className="text-sm font-medium text-muted-foreground">Verificando tu cuenta...</p>
          </>
        )}
      </div>
    </div>
  )
}
