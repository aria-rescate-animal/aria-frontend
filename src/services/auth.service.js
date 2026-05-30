import axios from 'axios'
import { API_AUTH_URL, API_ADMIN_URL } from '@/config/api'
import { obtenerToken } from '../utils/auth.utils'

const authHeader = () => ({
  headers: { Authorization: `Bearer ${obtenerToken()}` }
})

export const register = async (
  nombre, email, contrasena, rol = 'ciudadano',
  nit = null, nombre_organizacion = null,
  tipo_entidad = null, telefono_oficial = null,
  ciudad = null, representante = null,
  descripcion_entidad = null, servicios_ofrecidos = null,
  direccion_sede = null, enlace_verificacion = null
) => {
  const response = await axios.post(`${API_AUTH_URL}/register`, {
    nombre, email, contrasena, rol,
    nit, nombre_organizacion, tipo_entidad,
    telefono_oficial, ciudad, representante,
    descripcion_entidad,
    servicios_ofrecidos: Array.isArray(servicios_ofrecidos) ? servicios_ofrecidos : (servicios_ofrecidos || null),
    direccion_sede, enlace_verificacion
  })
  return response.data
}

export const login = async (email, contrasena) => {
  const response = await axios.post(`${API_AUTH_URL}/login`, { email, contrasena })
  if (response.data.token) {
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    if (response.data.pendienteAprobacion) {
      localStorage.setItem('pendienteAprobacion', '1')
    } else {
      localStorage.removeItem('pendienteAprobacion')
    }
  }
  return response.data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('pendienteAprobacion')
}

export const recuperarPassword = async (email) => {
  const response = await axios.post(`${API_AUTH_URL}/recuperar-password`, { email })
  return response.data
}

export const recuperar = recuperarPassword

export const resetPassword = async (resetToken, contrasena) => {
  const response = await axios.post(`${API_AUTH_URL}/reset-password`, { resetToken, contrasena })
  return response.data
}

export const patchPerfil = async (nombre) => {
  const response = await axios.patch(`${API_AUTH_URL}/perfil`, { nombre }, authHeader())
  return response.data
}

export const obtenerEntidadesDisponibles = async (categoria = '') => {
  const params = categoria ? `?categoria=${categoria}` : ''
  const response = await axios.get(`${API_AUTH_URL}/entidades-disponibles${params}`, authHeader())
  return response.data
}

export const obtenerUsuarios = async (page = 1, limit = 20) => {
  const response = await axios.get(
    `${API_ADMIN_URL}/usuarios?page=${page}&limit=${limit}`,
    authHeader()
  )
  return response.data
}

export const bloquearUsuario = async (id, accion) => {
  const response = await axios.patch(`${API_ADMIN_URL}/usuarios/${id}/bloquear`, { accion }, authHeader())
  return response.data
}
