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

// Obtener solo los reportes del usuario autenticado (ciudadano)
export const obtenerMisReportes = async (page = 1, limit = 20) => {
  const response = await axios.get(
    `${API_URL}/reportes/mis-reportes?page=${page}&limit=${limit}`,
    authHeader()
  );
  return response.data;
};

// Crear reporte
export const crearReporte = async ({ especie, descripcion, ubicacion, fotoFile }) => {
  const formData = new FormData();
  formData.append('especie', especie);
  formData.append('descripcion', descripcion);
  formData.append('ubicacion', ubicacion);
  if (fotoFile) formData.append('foto', fotoFile);

  const response = await axios.post(`${API_URL}/reportes`, formData, {
    headers: { Authorization: `Bearer ${obtenerToken()}` }
  });
  return response.data;
};

// Actualizar estado (solo entidades/admin)
export const actualizarEstado = async (id, estado) => {
  const response = await axios.patch(
    `${API_URL}/reportes/${id}/estado`,
    { estado },
    authHeader()
  );
  return response.data;
};
