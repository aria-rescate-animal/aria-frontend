import { useState, useEffect, useRef } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2, X, BellOff } from 'lucide-react';
import { getNotificaciones, contarNoLeidas, marcarLeida, marcarTodasLeidas } from '../services/notificaciones.service';

// Determina ícono y colores según el título de la notificación
function getNotifStyle(titulo = '') {
  const t = titulo.toLowerCase();
  if (t.includes('rescatado') || t.includes('aprobada')) {
    return { Icon: CheckCircle2, iconColor: '#16a34a', iconBg: '#dcfce7', dot: '#16a34a' };
  }
  if (t.includes('urgente') || t.includes('nuevo animal') || t.includes('necesita')) {
    return { Icon: AlertTriangle, iconColor: '#ea580c', iconBg: '#fed7aa', dot: '#ea580c' };
  }
  return { Icon: Info, iconColor: '#0d9488', iconBg: '#ccfbf1', dot: '#0d9488' };
}

function formatFecha(fecha) {
  if (!fecha) return '';
  const d    = new Date(fecha);
  const now  = new Date();
  const diff = Math.floor((now - d) / 60000);
  if (diff < 1)    return 'Ahora mismo';
  if (diff < 60)   return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

export default function Notificaciones() {
  const [abierto, setAbierto]           = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas]         = useState(0);
  const [cargando, setCargando]         = useState(false);
  const panelRef = useRef(null);

  // Polling cada 30s
  useEffect(() => {
    cargarConteo();
    const iv = setInterval(cargarConteo, 30000);
    return () => clearInterval(iv);
  }, []);

  // Cerrar al clic fuera
  useEffect(() => {
    const fn = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const cargarConteo = async () => {
    try { setNoLeidas(await contarNoLeidas()); } catch { /* silencioso */ }
  };

  const handleAbrir = async () => {
    const nuevo = !abierto;
    setAbierto(nuevo);
    if (nuevo) {
      setCargando(true);
      try { setNotificaciones(await getNotificaciones()); }
      catch { setNotificaciones([]); }
      finally { setCargando(false); }
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarLeida(id);
      setNotificaciones(p => p.map(n => n.id === id ? { ...n, leida: 1 } : n));
      setNoLeidas(p => Math.max(0, p - 1));
    } catch { /* silencioso */ }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasLeidas();
      setNotificaciones(p => p.map(n => ({ ...n, leida: 1 })));
      setNoLeidas(0);
    } catch { /* silencioso */ }
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>

      {/* Botón campana */}
      <button onClick={handleAbrir} title="Notificaciones" style={{
        position: 'relative', background: 'none', border: '1px solid #e2e8f0',
        borderRadius: '10px', width: '38px', height: '38px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.15s', color: '#64748b'
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.borderColor = '#99f6e4'; e.currentTarget.style.color = '#0d9488'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
      >
        <Bell size={17} />
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: '#ef4444', color: 'white', borderRadius: '99px',
            minWidth: '18px', height: '18px', fontSize: '0.65rem',
            fontWeight: '800', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '0 4px',
            border: '2px solid white', lineHeight: 1
          }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel */}
      {abierto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 0.6rem)', right: 0,
          width: '340px', background: 'white', borderRadius: '18px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9',
          zIndex: 999, overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.1rem 0.75rem', borderBottom: '1px solid #f8fafc', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={15} color="#0d9488" />
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>Notificaciones</span>
              {noLeidas > 0 && (
                <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: '700' }}>
                  {noLeidas} nueva{noLeidas > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {noLeidas > 0 && (
              <button onClick={handleMarcarTodas} style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600' }}>
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {cargando ? (
              // Skeleton
              [1,2,3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.1rem', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', width: '70%' }} />
                    <div style={{ height: '10px', background: '#f8fafc', borderRadius: '6px', width: '90%' }} />
                  </div>
                </div>
              ))
            ) : notificaciones.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BellOff size={22} color="#cbd5e1" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Sin notificaciones por ahora</span>
              </div>
            ) : (
              notificaciones.map(n => {
                const { Icon, iconColor, iconBg, dot } = getNotifStyle(n.titulo);
                const noLeida = !n.leida;
                return (
                  <div key={n.id}
                    onClick={() => noLeida && handleMarcarLeida(n.id)}
                    style={{
                      display: 'flex', gap: '0.75rem', padding: '0.875rem 1.1rem',
                      borderBottom: '1px solid #f8fafc',
                      background: noLeida ? '#f0fdfa' : 'white',
                      cursor: noLeida ? 'pointer' : 'default',
                      transition: 'background 0.15s', alignItems: 'flex-start'
                    }}
                    onMouseEnter={e => { if (noLeida) e.currentTarget.style.background = '#e6faf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = noLeida ? '#f0fdfa' : 'white'; }}
                  >
                    {/* Ícono con fondo pastel */}
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={iconColor} />
                    </div>

                    {/* Contenido */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 0.2rem', fontSize: '0.82rem', fontWeight: noLeida ? '700' : '600', color: '#0f172a', lineHeight: 1.3 }}>
                        {n.titulo}
                      </p>
                      <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {n.mensaje}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {formatFecha(n.fecha)}
                      </span>
                    </div>

                    {/* Punto de no leída */}
                    {noLeida && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
