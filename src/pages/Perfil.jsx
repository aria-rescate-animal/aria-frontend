import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { patchPerfil } from '@/services/auth.service'
import { User, Mail, Save, CheckCircle2 } from 'lucide-react'

export default function Perfil() {
  const { user, login, rol } = useAuth()
  const [name, setName]     = useState(user?.nombre || '')
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await patchPerfil(name)
      const token = localStorage.getItem('token')
      const updated = { ...user, nombre: name }
      localStorage.setItem('user', JSON.stringify(updated))
      login(token, updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar el perfil.')
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona tu información personal.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-4 border-b border-border p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <User className="h-8 w-8" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{user?.nombre}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Rol: {rol}</div>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">Nombre</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={user?.email || ''} disabled
                className="w-full rounded-xl border border-input bg-muted py-2.5 pl-10 pr-3 text-sm text-muted-foreground" />
            </div>
            <span className="mt-1 block text-[11px] text-muted-foreground">El email no se puede modificar.</span>
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Cambios guardados
              </span>
            )}
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 disabled:opacity-70">
              <Save className="h-4 w-4" /> Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
