import { Navigate } from 'react-router-dom';
import { haySesionActiva } from '../utils/auth.utils';

export default function RutaProtegida({ children }) {
  if (!haySesionActiva()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
