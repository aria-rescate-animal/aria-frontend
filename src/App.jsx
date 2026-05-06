import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login             from './pages/Login';
import Register          from './pages/Register';
import VerificarCodigo   from './pages/VerificarCodigo';
import RecuperarPassword from './pages/RecuperarPassword';
import ResetPassword     from './pages/ResetPassword';
import AuthCallback      from './pages/AuthCallback';
import Dashboard         from './pages/Dashboard';
import Perfil            from './pages/Perfil';
import Feed              from './pages/Feed';
import NuevoReporte      from './pages/NuevoReporte';
import AdminPanel        from './pages/AdminPanel';
import MainLayout        from './components/MainLayout';
import { useAuth }       from './context/AuthContext';

function RutaProtegida({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
}

function RutaAdmin({ children }) {
  const { isAuthenticated, esAdministrador } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!esAdministrador)  return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/"                      element={<Navigate to="/login" />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/register"              element={<Register />} />
        <Route path="/verificar-codigo"      element={<VerificarCodigo />} />
        <Route path="/recuperar"             element={<RecuperarPassword />} />
        <Route path="/reset-password"        element={<ResetPassword />} />

        {/* Callbacks de OAuth y Magic Link */}
        <Route path="/auth/callback"         element={<AuthCallback />} />
        <Route path="/auth/verificar/:token" element={<AuthCallback />} />

        {/* Protegidas con MainLayout */}
        <Route path="/dashboard"     element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/perfil"        element={<RutaProtegida><Perfil /></RutaProtegida>} />
        <Route path="/reportes"      element={<RutaProtegida><Feed /></RutaProtegida>} />
        <Route path="/nuevo-reporte" element={<RutaProtegida><NuevoReporte /></RutaProtegida>} />

        {/* Admin */}
        <Route path="/admin" element={<RutaAdmin><AdminPanel /></RutaAdmin>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
