import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ADMIN_URL } from '@/config/api'
import { obtenerToken } from '@/utils/auth.utils'
import { Bell, Send, ShieldCheck, Users, Building2, AlertCircle } from 'lucide-react'

const auth = () => ({ headers: { Authorization: `Bearer ${obtenerToken()}` } })

export function TabBroadcast() {
  const [titulo, setTitulo]   = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [alcance, setAlcance] = useState(null)
  const [loadingAlcance, setLoadingAlcance] = useState(true)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  useEffect(() => {
    axios.get(`${API_ADMIN_URL}/broadcast/alcance`, auth())
      .then(r => setAlcance(r.data))
      .catch(() => setAlcance(null))
      .finally(() => setLoadingAlcance(false))
  }, [])

  const enviar = async (e) => {
    e.preventDefault()
    if (!titulo.trim() || !mensaje.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await axios.post(`${API_ADMIN_URL}/broadcast`, { titulo, mensaje }, auth())
      setResult(data)
      setTitulo(''); setMensaje('')
      const { data: nuevoAlcance } = await axios.get(`${API_ADMIN_URL}/broadcast/alcance`, auth())
      setAlcance(nuevoAlcance)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar el comunicado.')
    } finally { setLoading(false) }
  }

  const copyResultado = (r) => {
    if (!r || r.enviados === 0) return 'No había cuentas activas para notificar.'
    const partes = []
    if (r.ciudadanos > 0) partes.push(`${r.ciudadanos} ciudadano${r.ciudadanos > 1 ? 's' : ''}`)
    if (r.entidades  > 0) partes.push(`${r.entidades} entidad${r.entidades > 1 ? 'es' : ''}`)
    return `Comunicado enviado a ${partes.join(' y ')}.`
  }

  return (
    <>
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal mb-2">
          <Bell className="h-3.5 w-3.5" /> Comunicado del sistema
        </div>
        <h1 className="text-xl font-bold text-foreground">Enviar comunicado</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notifica a ciudadanos y entidades activas. Los administradores no reciben este comunicado.
        </p>
      </header>

      <div className="max-w-2xl space-y-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Destinatarios de este comunicado
          </p>
          {loadingAlcance ? (
            <div className="flex gap-4 animate-pulse">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          ) : alcance ? (
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-navy" />
                {alcance.ciudadanos} ciudadano{alcance.ciudadanos !== 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-teal" />
                {alcance.entidades} entidad{alcance.entidades !== 1 ? 'es' : ''}
              </span>
              <span className="text-xs text-muted-foreground self-center">
                · {alcance.total} cuenta{alcance.total !== 1 ? 's' : ''} activa{alcance.total !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No se pudo calcular el alcance.</span>
          )}
        </div>

        {result && (
          <div className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
            result.enviados > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-muted border-border'
          }`}>
            <ShieldCheck className={`h-4 w-4 flex-shrink-0 mt-0.5 ${result.enviados > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`} />
            <p className={`text-sm font-semibold ${result.enviados > 0 ? 'text-emerald-700' : 'text-muted-foreground'}`}>
              {copyResultado(result)}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={enviar} className="rounded-lg border border-border bg-card p-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">Asunto del comunicado *</span>
            <input value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Mantenimiento programado el sábado 24"
              className="w-full rounded-lg border border-input bg-card py-2 px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">Contenido *</span>
            <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={4}
              placeholder="Escribe el comunicado..."
              className="w-full rounded-lg border border-input bg-card py-2 px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 resize-none" />
          </label>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">Solo cuentas activas y verificadas.</p>
            <button type="submit"
              disabled={loading || !titulo.trim() || !mensaje.trim() || alcance?.total === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
              <Send className="h-3.5 w-3.5" />
              {loading ? 'Enviando...' : `Enviar${alcance ? ` a ${alcance.total}` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
