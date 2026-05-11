import axios from 'axios';
import { obtenerToken } from '../utils/auth.utils';

const API_URL   = 'http://localhost:3000/api/auth';
const API_ADMIN = 'http://localhost:3000/api/admin';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${obtenerToken()}` }
});

export const register = async (
  nombre, email, contrasena, rol = 'ciudadano',
  nit = null, nombre_organizacion = null,
  tipo_entidad = null, telefono_oficial = null,
  direccion_sede = null, enlace_verificacion = null
) => {
  const response = await axios.post(`${API_URL}/register`, {
    nombre, email, contrasena, rol,
    nit, nombre_organizacion,
    tipo_entidad, telefono_oficial,
    direccion_sede, enlace_verificacion
  });
  return response.data;
};

export const login = async (email, contrasena) => {
  const response = await axios.post(`${API_URL}/login`, { email, contrasena });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const recuperarPassword = async (email) => {
  const response = await axios.post(`${API_URL}/recuperar-password`, { email });
  return response.data;
};

export const resetPassword = async (token, contrasena) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, contrasena });
  return response.data;
};

// Actualizar nombre del usuario autenticado
export const patchPerfil = async (nombre) => {
  const response = await axios.patch(`${API_URL}/perfil`, { nombre }, authHeader());
  return response.data;
};

// Obtener lista de usuarios (solo admin)
export const obtenerUsuarios = async (page = 1, limit = 20) => {
  const response = await axios.get(
    `${API_ADMIN}/usuarios?page=${page}&limit=${limit}`,
    authHeader()
  );
  return response.data;
};

// Bloquear o desbloquear usuario (solo admin)
export const bloquearUsuario = async (id, accion) => {
  const response = await axios.patch(
    `${API_ADMIN}/usuarios/${id}/bloquear`,
    { accion },
    authHeader()
  );
  return response.data;
};
