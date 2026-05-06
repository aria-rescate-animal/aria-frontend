export const guardarToken = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const obtenerToken = () => localStorage.getItem('token');

export const obtenerUsuario = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const eliminarToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const haySesionActiva = () => !!localStorage.getItem('token');

export const obtenerRol = () => {
  const user = obtenerUsuario();
  return user?.rol || null;
};

export const redirigirSegunRol = (navigate, rol) => {
  if (rol === 'administrador') navigate('/admin', { replace: true });
  else navigate('/dashboard', { replace: true });
};
