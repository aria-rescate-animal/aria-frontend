// ─── Fuente única de URLs de la API ───────────────────────────────
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const API_BASE_URL  = BASE
export const API_AUTH_URL  = `${BASE}/auth`
export const API_ADMIN_URL = `${BASE}/admin`
