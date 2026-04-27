import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerUsuario, eliminarToken } from '../utils/auth.utils';

const menuItems = [
  { icon: '🏠', label: 'Inicio', path: '/dashboard' },
  { icon: '🐾', label: 'Rescates', path: '/reportes' },
  { icon: '📍', label: 'Mapa', path: '/mapa' },
  { icon: '🏥', label: 'Veterinarios', path: '/veterinarios' },
  { icon: '👤', label: 'Mi perfil', path: '/perfil' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = obtenerUsuario();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('/dashboard');

  const handleLogout = () => { eliminarToken(); navigate('/login'); };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar" style={{ width: sidebarOpen ? '240px' : '68px' }}>
        <div className="dashboard-sidebar-header">
          <span className="dashboard-sidebar-logo">🐾</span>
          {sidebarOpen && <span className="dashboard-sidebar-title">ARIA</span>}
        </div>

        <nav className="dashboard-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`dashboard-menu-item${activeItem === item.path ? ' active' : ''}`}
              onClick={() => setActiveItem(item.path)}
            >
              <span className="dashboard-menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="dashboard-menu-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button className="dashboard-logout-btn" onClick={handleLogout} title="Cerrar sesión">
          <span>🚪</span>
          {sidebarOpen && <span style={{ marginLeft: '0.75rem' }}>Cerrar sesión</span>}
        </button>

        <button className="dashboard-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-header-title">{saludo}, {user?.nombre || 'Usuario'} 👋</h1>
            <p className="dashboard-header-sub">Bienvenido al panel de ARIA · Rol: <strong>{user?.rol || 'rescatista'}</strong></p>
          </div>
          <Link to="/perfil" className="dashboard-avatar-link" title="Ver perfil">
            <div className="dashboard-avatar">{(user?.nombre || 'U')[0].toUpperCase()}</div>
          </Link>
        </div>

        <div className="dashboard-stats-grid">
          {[
            { icon: '🐶', label: 'Animales rescatados', value: '124', varColor: 'var(--aria-azul)' },
            { icon: '📋', label: 'Casos activos', value: '8', varColor: 'var(--aria-texto-success)' },
            { icon: '🏥', label: 'Veterinarios disponibles', value: '5', varColor: 'var(--aria-texto-warning)' },
            { icon: '📍', label: 'Zonas monitoreadas', value: '12', varColor: '#6A1B9A' },
          ].map((stat) => (
            <div key={stat.label} className="dashboard-stat-card">
              <span className="dashboard-stat-icon">{stat.icon}</span>
              <div>
                <p className="dashboard-stat-value" style={{ color: stat.varColor }}>{stat.value}</p>
                <p className="dashboard-stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-banner">
          <div>
            <h2 className="dashboard-banner-title">¡El rescate comienza aquí! 🐾</h2>
            <p className="dashboard-banner-text">Usa el mapa para reportar animales en situación de calle o consulta los casos activos para hacer seguimiento.</p>
          </div>
          <span className="dashboard-banner-emoji">🐕</span>
        </div>
      </main>
    </div>
  );
}
