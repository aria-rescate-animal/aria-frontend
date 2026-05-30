import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import { obtenerToken } from '../utils/auth.utils'

const authHeader = () => ({
  headers: { Authorization: `Bearer ${obtenerToken()}` }
})

// PÚBLICO — sin token
export const obtenerRescatadosPublicos = async () => {
  const response = await axios.get(`${API_BASE_URL}/reportes/rescatados-publicos`)
  return response.data
}

// AUTENTICADOS
export const obtenerReportes = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.categoria) query.append('categoria', params.categoria)
  if (params.prioridad) query.append('prioridad', params.prioridad)
  const response = await axios.get(
    `${API_BASE_URL}/reportes?${query.toString()}`,
    authHeader()
  )
  return response.data
}

export const obtenerMisReportes = async (page = 1, limit = 20) => {
  const response = await axios.get(
    `${API_BASE_URL}/reportes/mis-reportes?page=${page}&limit=${limit}`,
    authHeader()
  )
  return response.data
}

// crearReporte incluye prioridad
export const crearReporte = async ({
  especie, descripcion, ubicacion, categoria, prioridad = 'normal',
  entidad_asignada_id, latitud = null, longitud = null, fotoFile
}) => {
  const formData = new FormData()
  formData.append('especie',     especie)
  formData.append('descripcion', descripcion)
  formData.append('ubicacion',   ubicacion)
  if (categoria)           formData.append('categoria', categoria)
  if (prioridad)           formData.append('prioridad', prioridad)
  if (entidad_asignada_id) formData.append('entidad_asignada_id', entidad_asignada_id)
  if (latitud !== null && latitud !== undefined && latitud !== '') formData.append('latitud', latitud)
  if (longitud !== null && longitud !== undefined && longitud !== '') formData.append('longitud', longitud)
  if (fotoFile)            formData.append('foto', fotoFile)

  const response = await axios.post(`${API_BASE_URL}/reportes`, formData, {
    headers: { Authorization: `Bearer ${obtenerToken()}` }
  })
  return response.data
}

export const actualizarEstado = async (id, estado, nota = null) => {
  const response = await axios.patch(
    `${API_BASE_URL}/reportes/${id}/estado`,
    { estado, ...(nota ? { nota } : {}) },
    authHeader()
  )
  return response.data
}

export const reportarInvalido = async (id, motivo, tipo = 'posible_falso') => {
  const response = await axios.post(
    `${API_BASE_URL}/reportes/${id}/reportar`,
    { motivo, tipo },
    authHeader()
  )
  return response.data
}

// MASCOTAS PERDIDAS
export const obtenerMascotasPerdidas = async ({ zona, especie, fecha, estado = 'perdido', page = 1, limit = 20, q } = {}) => {
  const params = new URLSearchParams()
  if (zona)    params.append('zona', zona)
  if (especie) params.append('especie', especie)
  if (fecha)   params.append('fecha', fecha)
  if (estado)  params.append('estado', estado)
  if (q)       params.append('q', q)
  params.append('page', page)
  params.append('limit', limit)

  const token = obtenerToken()
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const response = await axios.get(
    `${API_BASE_URL}/mascotas-perdidas?${params.toString()}`,
    { headers }
  )
  return response.data
}

export const publicarMascotaPerdida = async ({ nombre, especie, descripcion, zona, contacto, fotoFile }) => {
  const formData = new FormData()
  formData.append('nombre', nombre)
  formData.append('especie', especie)
  formData.append('descripcion', descripcion)
  formData.append('zona', zona)
  formData.append('contacto', contacto)
  if (fotoFile) formData.append('foto', fotoFile)

  const response = await axios.post(`${API_BASE_URL}/mascotas-perdidas`, formData, {
    headers: { Authorization: `Bearer ${obtenerToken()}` }
  })
  return response.data
}

export const marcarEncontrada = async (id) => {
  const response = await axios.patch(
    `${API_BASE_URL}/mascotas-perdidas/${id}/encontrada`,
    {},
    authHeader()
  )
  return response.data
}

export const cerrarMascotaPerdida = async (id) => {
  const response = await axios.patch(
    `${API_BASE_URL}/mascotas-perdidas/${id}/cerrar`,
    {},
    authHeader()
  )
  return response.data
}
