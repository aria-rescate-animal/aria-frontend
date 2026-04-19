import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Feed from './pages/Feed';
import NuevoReporte from './pages/NuevoReporte';
import RutaProtegida from './components/RutaProtegida';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas protegidas */}
        <Route path="/dashboard"     element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/perfil"        element={<RutaProtegida><Perfil /></RutaProtegida>} />
        <Route path="/reportes"      element={<RutaProtegida><Feed /></RutaProtegida>} />
        <Route path="/nuevo-reporte" element={<RutaProtegida><NuevoReporte /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
