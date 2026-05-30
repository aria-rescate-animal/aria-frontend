import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import { obtenerToken } from '../utils/auth.utils'

const authHeader = () => ({
  headers: { Authorization: `Bearer ${obtenerToken()}` }
})

export const getNotificaciones = async () => {
  const response = await axios.get(`${API_BASE_URL}/notificaciones`, authHeader())
  return response.data
}

export const contarNoLeidas = async () => {
  const response = await axios.get(`${API_BASE_URL}/notificaciones/no-leidas`, authHeader())
  return response.data.total
}

export const marcarLeida = async (id) => {
  const response = await axios.patch(`${API_BASE_URL}/notificaciones/${id}/leer`, {}, authHeader())
  return response.data
}

export const marcarTodasLeidas = async () => {
  const response = await axios.patch(`${API_BASE_URL}/notificaciones/leer-todas`, {}, authHeader())
  return response.data
}
