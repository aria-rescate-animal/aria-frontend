import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const register = async (nombre, email, contrasena) => {
  const response = await axios.post(`${API_URL}/register`, { nombre, email, contrasena });
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

export const recuperar = async (email) => {
  const response = await axios.post(`${API_URL}/recuperar`, { email });
  return response.data;
};

export const resetPassword = async (token, contrasena) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, contrasena });
  return response.data;
};
