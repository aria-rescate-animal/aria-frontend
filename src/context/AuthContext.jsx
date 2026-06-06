/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback((token, userData, extraFlags = {}) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    if (extraFlags.pendienteAprobacion) {
      localStorage.setItem('pendienteAprobacion', '1')
    } else {
      localStorage.removeItem('pendienteAprobacion')
    }
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('pendienteAprobacion')
    setUser(null)
  }, [])

  const isAuthenticated  = !!user
  const rol              = user?.rol || null
  const esEntidad        = rol === 'entidad'
  const esCiudadano      = rol === 'ciudadano'
  const esAdministrador  = rol === 'administrador'
  const puedeRescatar    = esEntidad || esAdministrador

  const entidadPendiente = esEntidad && localStorage.getItem('pendienteAprobacion') === '1'

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      isAuthenticated, rol,
      esEntidad, esCiudadano, esAdministrador, puedeRescatar,
      entidadPendiente,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
