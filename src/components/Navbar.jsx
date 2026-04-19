// Issue #14 - Configuracion de Rutas y Navegacion
// Issue #14 - Configuracion de Rutas y Navegacion
import { Link, useLocation } from 'react-router-dom';
import { obtenerUsuario, eliminarToken } from '../utils/auth.utils';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { label: '🏠 Inicio', path: '/dashboard' },
  { label: '🐾 Rescates', path: '/reportes' },
  { label: '➕ Nuevo reporte', path: '/nuevo-reporte' },
  { label: '👤 Perfil', path: '/perfil' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = obtenerUsuario();

  const handleLogout = () => {
    eliminarToken();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/dashboard" style={styles.logo}>🐾 ARIA</Link>
        <div style={styles.links}>
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              style={{ ...styles.link, ...(location.pathname === l.path ? styles.linkActive : {}) }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div style={styles.right}>
          <span style={styles.userName}>{user?.nombre?.split(' ')[0] || 'Usuario'}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>🚪</button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: 'linear-gradient(90deg, #0A2463, #1565C0)', boxShadow: '0 2px 12px rgba(10,36,99,0.2)', position: 'sticky', top: 0, zIndex: 100 },
  inner: { maxWidth: '1100px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', height: '58px' },
  logo: { color: 'white', fontWeight: '800', fontSize: '1.2rem', textDecoration: 'none', letterSpacing: '3px', flexShrink: 0 },
  links: { display: 'flex', gap: '0.25rem', flex: 1, flexWrap: 'wrap' },
  link: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '500', transition: 'background 0.15s' },
  linkActive: { background: 'rgba(255,255,255,0.18)', color: 'white', fontWeight: '700' },
  right: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
  userName: { color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem' },
  logoutBtn: { background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '1rem' },
};
