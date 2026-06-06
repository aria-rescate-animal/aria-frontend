import { createElement, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { login as loginApi } from '@/services/auth.service'
import { API_AUTH_URL } from '@/config/api'
import { PawPrint, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const mensajeEstado = location.state?.mensaje || ''

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginApi(email, pass)

      login(data.token, data.user, {
        pendienteAprobacion: !!data.pendienteAprobacion
      })

      if (data.pendienteAprobacion) {
        navigate('/pendiente-aprobacion', { replace: true })
      } else if (data.user?.rol === 'administrador') {
        navigate('/admin', { replace: true })
      } else if (data.user?.rol === 'entidad') {
        navigate('/reportes', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      if (err.response?.data?.requiereVerificacion) {
        navigate('/verificar-codigo', { state: { email } })
        return
      }
      const msg = err.response?.data?.error
      if (err.response?.data?.estado_aprobacion === 'rechazada') {
        const motivo = err.response.data.motivo_rechazo
        setError(motivo ? `Tu solicitud de entidad fue rechazada. Motivo: ${motivo}` : 'Tu solicitud de entidad fue rechazada.')
      } else if (err.response?.data?.bloqueado) {
        setError('Tu cuenta está bloqueada. Contacta al administrador.')
      } else {
        setError(msg || 'No pudimos iniciar sesión con esos datos. Verifica tu correo y contraseña.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-gradient-to-br from-navy to-navy-light p-12 text-white md:flex md:flex-col md:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <PawPrint className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">ARIA</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Bienvenido de nuevo</h2>
          <p className="mt-3 max-w-sm text-white/80">Continúa gestionando reportes, seguimiento y atención animal desde ARIA.</p>
        </div>
        <div className="text-xs text-white/60">© 2026 ARIA</div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 md:p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <Link to="/" className="mb-5 inline-flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-navy text-white">
              <PawPrint className="h-4 w-4" />
            </div>
            <span className="text-base font-bold text-foreground">ARIA</span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accede a tu cuenta para continuar en ARIA.</p>

          {mensajeEstado && (
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {mensajeEstado}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field icon={Mail} label="Correo electrónico" type="email" value={email} onChange={setEmail} placeholder="correo@ejemplo.com" />
            <Field
              icon={Lock}
              label="Contraseña"
              type={showPass ? 'text' : 'password'}
              value={pass}
              onChange={setPass}
              placeholder="********"
              rightAction={(
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            />

            <div className="text-right">
              <Link to="/recuperar" className="text-xs text-navy hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-70">
              {loading ? 'Ingresando...' : <><span>Iniciar sesión</span><ArrowRight className="h-4 w-4" /></>}
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <span className="relative bg-background px-3 text-xs text-muted-foreground">o continúa con</span>
            </div>

            <button type="button" onClick={() => { window.location.href = `${API_AUTH_URL}/google` }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <p className="pt-4 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold text-navy hover:underline">Regístrate</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ icon, label, type = 'text', value, onChange, placeholder, rightAction }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>
      <div className="relative">
        {createElement(icon, { className: 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' })}
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
          className={'w-full rounded-xl border border-input bg-card py-2.5 pl-10 ' + (rightAction ? 'pr-10' : 'pr-3') + ' text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30'} />
        {rightAction}
      </div>
    </label>
  )
}
