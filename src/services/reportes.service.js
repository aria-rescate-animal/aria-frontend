// Servicio de reportes - conecta con el backend NestJS
import axios from 'axios';
import { obtenerToken } from '../utils/auth.utils';

const API_URL = 'http://localhost:3000/api';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${obtenerToken()}` }
});

// Obtener todos los reportes
export const obtenerReportes = async () => {
  const response = await axios.get(`${API_URL}/reportes`, authHeader());
  return response.data;
};

// Crear un nuevo reporte
export const crearReporte = async (datos) => {
  const response = await axios.post(`${API_URL}/reportes`, datos, authHeader());
  return response.data;
};

// Actualizar estado de un reporte
export const actualizarEstado = async (id, estado) => {
  const response = await axios.patch(
    `${API_URL}/reportes/${id}/estado`,
    { estado },
    authHeader()
  );
  return response.data;
};
