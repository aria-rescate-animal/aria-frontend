import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  PawPrint, LayoutDashboard, ClipboardList, Plus,
  Bell, User, LogOut, ChevronDown, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Notificaciones from './Notificaciones';

const ROL_BADGE = {
  ciudadano:     { label: 'Ciudadano',     cls: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' } },
  entidad:       { label: 'Entidad',       cls: { background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' } },
  administrador: { label: 'Administrador', cls: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' } },
};

const NAV_CIUDADANO = [
  { icon: LayoutDashboard, label: 'Inicio',        path: '/dashboard' },
  { icon: ClipboardList,   label: 'Feed de casos', path: '/reportes' },
  { icon: Plus,            label: 'Nuevo reporte', path: '/nuevo-reporte' },
];

const NAV_ENTIDAD = [
  { icon: LayoutDashboard, label: 'Inicio',          path: '/dashboard' },
  { icon: ClipboardList,   label: 'Gestión de casos', path: '/reportes' },
];

export default function MainLayout({ children }) {
  const { user, logout, puedeRescatar, esAdministrador } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const dropdownRef = useRef(null);

  const rolInfo = ROL_BADGE[user?.rol] || ROL_BADGE.ciudadano;
  const navLinks = esAdministrador ? [] : puedeRescatar ? NAV_ENTIDAD : NAV_CIUDADANO;

  useEffect(() => {
    const fn = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  const isActive = path => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Navbar superior fijo */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'white', borderBottom: '1px solid #e2e8f0',
        height: '60px', display: 'flex', alignItems: 'center',
        padding: '0 1.5rem', gap: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '34px', height: '34px', background: '#2563eb', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PawPrint size={17} color="white" />
          </div>
          <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem', letterSpacing: '1px' }}>ARIA</span>
        </Link>

        {/* Nav links — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1 }} className="nav-desktop">
          {navLinks.map(item => {
            const Icon   = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.45rem 0.85rem', borderRadius: '8px',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: active ? '600' : '500',
                color: active ? '#2563eb' : '#64748b',
                background: active ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s'
              }}>
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Derecha: notificaciones + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          <Notificaciones />

          {/* Avatar dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: '1px solid #e2e8f0', borderRadius: '99px',
              padding: '0.25rem 0.75rem 0.25rem 0.35rem',
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {/* Avatar circular */}
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '0.8rem',
                flexShrink: 0, boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
              }}>
                {(user?.nombre || 'U')[0].toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', color: '#0f172a', lineHeight: 1.2 }}>
                  {user?.nombre?.split(' ')[0]}
                </p>
                <span style={{ ...rolInfo.cls, fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '99px', fontWeight: '600', display: 'inline-block', lineHeight: 1.4 }}>
                  {rolInfo.label}
                </span>
              </div>
              <ChevronDown size={13} color="#94a3b8" style={{ marginLeft: '2px' }} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                background: 'white', borderRadius: '14px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
                minWidth: '200px', overflow: 'hidden', zIndex: 200
              }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f8fafc', background: '#f8fafc' }}>
                  <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.875rem' }}>{user?.nombre}</p>
                  <p style={{ margin: '0.15rem 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>{user?.email}</p>
                </div>
                <Link to="/perfil" onClick={() => setDropdownOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 1rem', color: '#374151',
                  textDecoration: 'none', fontSize: '0.875rem'
                }}>
                  <User size={14} color="#2563eb" /> Mi perfil
                </Link>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  width: '100%', padding: '0.7rem 1rem', background: 'none',
                  border: 'none', color: '#dc2626', fontSize: '0.875rem',
                  cursor: 'pointer', textAlign: 'left'
                }}>
                  <LogOut size={14} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Botón móvil */}
          <button onClick={() => setMobileOpen(v => !v)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} className="nav-mobile-btn">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 99,
          background: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem'
        }}>
          {navLinks.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.65rem 0.75rem', borderRadius: '8px',
                  textDecoration: 'none', fontSize: '0.875rem',
                  color: isActive(item.path) ? '#2563eb' : '#374151',
                  background: isActive(item.path) ? '#eff6ff' : 'transparent',
                  fontWeight: isActive(item.path) ? '600' : '500'
                }}>
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Contenido principal — con padding-top para el navbar fijo */}
      <main style={{ paddingTop: '60px', minHeight: '100vh' }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
