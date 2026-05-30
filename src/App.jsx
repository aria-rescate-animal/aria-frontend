import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Landing           from './pages/Landing'
import Login             from './pages/Login'
import Register          from './pages/Register'
import VerificarCodigo   from './pages/VerificarCodigo'
import RecuperarPassword from './pages/RecuperarPassword'
import ResetPassword     from './pages/ResetPassword'
import AuthCallback      from './pages/AuthCallback'
import Dashboard         from './pages/Dashboard'
import Feed              from './pages/Feed'
import NuevoReporte      from './pages/NuevoReporte'
import MisReportes       from './pages/MisReportes'
import AnimalesPerdidos  from './pages/AnimalesPerdidos'
import AdminPanel        from './pages/AdminPanel'
import Perfil            from './pages/Perfil'
import EntidadPendiente  from './pages/EntidadPendiente'
import NotFound          from './pages/NotFound'
import DashboardLayout   from './components/DashboardLayout'

/* ── Guards ─────────────────────────────────────────────────────── */

function Protegida() {
  const { isAuthenticated, entidadPendiente } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (entidadPendiente) return <Navigate to="/pendiente-aprobacion" replace />
  return <DashboardLayout />
}

function SoloCiudadano() {
  const { isAuthenticated, esCiudadano, esEntidad, entidadPendiente } = useAuth()
  if (!isAuthenticated)  return <Navigate to="/login" replace />
  if (entidadPendiente)  return <Navigate to="/pendiente-aprobacion" replace />
  if (esEntidad)         return <Navigate to="/reportes" replace />
  if (!esCiudadano)      return <Navigate to="/admin" replace />
  return <DashboardLayout />
}

function SoloAdmin() {
  const { isAuthenticated, esAdministrador } = useAuth()
  if (!isAuthenticated)   return <Navigate to="/login" replace />
  if (!esAdministrador)   return <Navigate to="/dashboard" replace />
  return <DashboardLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<Landing />} />
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/verificar-codigo" element={<VerificarCodigo />} />
        <Route path="/recuperar"        element={<RecuperarPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />
        <Route path="/perdidos"         element={<AnimalesPerdidos />} />

        <Route path="/auth/callback"         element={<AuthCallback />} />
        <Route path="/auth/verificar/:token" element={<AuthCallback />} />

        <Route path="/pendiente-aprobacion" element={<EntidadPendiente />} />

        <Route element={<SoloCiudadano />}>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/nuevo-reporte" element={<NuevoReporte />} />
          <Route path="/mis-reportes"  element={<MisReportes />} />
        </Route>

        <Route element={<Protegida />}>
          <Route path="/reportes"          element={<Feed />} />
          <Route path="/animales-perdidos" element={<AnimalesPerdidos />} />
          <Route path="/perfil"            element={<Perfil />} />
        </Route>

        <Route element={<SoloAdmin />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
