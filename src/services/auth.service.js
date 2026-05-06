import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

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
