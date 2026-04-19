import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerUsuario, eliminarToken } from '../utils/auth.utils';

const menuItems = [
  { icon: '🏠', label: 'Inicio', path: '/dashboard' },
  { icon: '🐾', label: 'Rescates', path: '/rescates' },
  { icon: '📍', label: 'Mapa', path: '/mapa' },
  { icon: '🏥', label: 'Veterinarios', path: '/veterinarios' },
  { icon: '👤', label: 'Mi perfil', path: '/perfil' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = obtenerUsuario();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('/dashboard');

  const handleLogout = () => {
    eliminarToken();
    navigate('/login');
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .menu-item:hover { background: rgba(255,255,255,0.12) !important; }
        .card-stat:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(10,36,99,0.15) !important; }
        .card-stat { transition: all 0.2s; }
        .btn-logout:hover { background: rgba(255,255,255,0.2) !important; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? '240px' : '68px' }}>
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarLogo}>🐾</span>
          {sidebarOpen && <span style={styles.sidebarTitle}>ARIA</span>}
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="menu-item"
              onClick={() => setActiveItem(item.path)}
              style={{
                ...styles.menuItem,
                background: activeItem === item.path ? 'rgba(255,255,255,0.18)' : 'transparent',
                borderLeft: activeItem === item.path ? '3px solid #00E5FF' : '3px solid transparent',
              }}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              {sidebarOpen && <span style={styles.menuLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          className="btn-logout"
          onClick={handleLogout}
          style={styles.logoutBtn}
          title="Cerrar sesión"
        >
          <span>🚪</span>
          {sidebarOpen && <span style={{ marginLeft: '0.75rem' }}>Cerrar sesión</span>}
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={styles.toggleBtn}
          title="Colapsar menú"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>{saludo}, {user?.nombre || 'Usuario'} 👋</h1>
            <p style={styles.headerSub}>Bienvenido al panel de ARIA · Rol: <strong>{user?.rol || 'rescatista'}</strong></p>
          </div>
          <Link to="/perfil" style={styles.avatarBtn} title="Ver perfil">
            <div style={styles.avatar}>{(user?.nombre || 'U')[0].toUpperCase()}</div>
          </Link>
        </div>

        {/* Stats cards */}
        <div style={styles.statsGrid}>
          {[
            { icon: '🐶', label: 'Animales rescatados', value: '124', color: '#E3F2FD', accent: '#1565C0' },
            { icon: '📋', label: 'Casos activos', value: '8', color: '#E8F5E9', accent: '#2E7D32' },
            { icon: '🏥', label: 'Veterinarios disponibles', value: '5', color: '#FFF3E0', accent: '#E65100' },
            { icon: '📍', label: 'Zonas monitoreadas', value: '12', color: '#F3E5F5', accent: '#6A1B9A' },
          ].map((stat) => (
            <div key={stat.label} className="card-stat" style={{ ...styles.statCard, background: stat.color }}>
              <span style={styles.statIcon}>{stat.icon}</span>
              <div>
                <p style={{ ...styles.statValue, color: stat.accent }}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Welcome banner */}
        <div style={styles.banner}>
          <div>
            <h2 style={styles.bannerTitle}>¡El rescate comienza aquí! 🐾</h2>
            <p style={styles.bannerText}>Usa el mapa para reportar animales en situación de calle o consulta los casos activos para hacer seguimiento.</p>
          </div>
          <span style={styles.bannerEmoji}>🐕</span>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#F0F6FF', fontFamily: 'system-ui, sans-serif' },
  sidebar: { background: 'linear-gradient(180deg, #0A2463 0%, #1565C0 100%)', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'width 0.25s', overflow: 'hidden', flexShrink: 0 },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  sidebarLogo: { fontSize: '1.8rem', flexShrink: 0 },
  sidebarTitle: { color: 'white', fontWeight: '800', fontSize: '1.3rem', letterSpacing: '4px' },
  nav: { flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.75rem', borderRadius: '10px', textDecoration: 'none', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', transition: 'all 0.15s' },
  menuIcon: { fontSize: '1.2rem', flexShrink: 0, width: '24px', textAlign: 'center' },
  menuLabel: { whiteSpace: 'nowrap', fontWeight: '500' },
  logoutBtn: { margin: '0.5rem', padding: '0.7rem 0.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '10px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.9rem', transition: 'background 0.2s' },
  toggleBtn: { position: 'absolute', bottom: '1rem', right: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' },
  main: { flex: 1, padding: '2rem', animation: 'fadeIn 0.4s ease both', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  headerTitle: { color: '#0A2463', fontSize: '1.6rem', fontWeight: '800', margin: 0 },
  headerSub: { color: '#888', fontSize: '0.88rem', margin: '0.25rem 0 0' },
  avatarBtn: { textDecoration: 'none' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #0097A7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(21,101,192,0.3)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 12px rgba(10,36,99,0.07)' },
  statIcon: { fontSize: '2rem' },
  statValue: { fontSize: '1.8rem', fontWeight: '800', margin: 0, lineHeight: 1 },
  statLabel: { color: '#666', fontSize: '0.8rem', margin: '0.2rem 0 0', lineHeight: 1.3 },
  banner: { background: 'linear-gradient(135deg, #0A2463, #0097A7)', borderRadius: '16px', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { color: 'white', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 0.5rem' },
  bannerText: { color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', margin: 0, maxWidth: '480px', lineHeight: 1.6 },
  bannerEmoji: { fontSize: '4rem', opacity: 0.8 },
};
