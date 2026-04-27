import { useState, useEffect, useRef } from 'react';
import { getNotificaciones, contarNoLeidas, marcarLeida, marcarTodasLeidas } from '../services/notificaciones.service';

export default function Notificaciones() {
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const panelRef = useRef(null);

  // Contar no leídas cada 30 segundos
  useEffect(() => {
    cargarConteo();
    const intervalo = setInterval(cargarConteo, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  const cargarConteo = async () => {
    try {
      const total = await contarNoLeidas();
      setNoLeidas(total);
    } catch {
      // Si el backend no responde, no muestra error
    }
  };

  const handleAbrir = async () => {
    setAbierto(!abierto);
    if (!abierto) {
      setCargando(true);
      try {
        const data = await getNotificaciones();
        setNotificaciones(data);
      } catch {
        setNotificaciones([]);
      } finally {
        setCargando(false);
      }
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarLeida(id);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: 1 } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch {
      // silencioso
    }
  };

  const handleMarcarTodas = async () => {
    try {
      await marcarTodasLeidas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: 1 })));
      setNoLeidas(0);
    } catch {
      // silencioso
    }
  };

  const formatearFecha = (fecha) => {
    const d = new Date(fecha);
    const ahora = new Date();
    const diff = Math.floor((ahora - d) / 1000 / 60);
    if (diff < 1) return 'Ahora mismo';
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
    return d.toLocaleDateString('es-CO');
  };

  return (
    <div style={styles.wrapper} ref={panelRef}>
      {/* Campana */}
      <button style={styles.campana} onClick={handleAbrir} title="Notificaciones">
        🔔
        {noLeidas > 0 && (
          <span style={styles.badge}>{noLeidas > 9 ? '9+' : noLeidas}</span>
        )}
      </button>

      {/* Panel */}
      {abierto && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitulo}>🔔 Notificaciones</span>
            {noLeidas > 0 && (
              <button style={styles.btnTodas} onClick={handleMarcarTodas}>
                Marcar todas
              </button>
            )}
          </div>

          <div style={styles.lista}>
            {cargando ? (
              <div style={styles.empty}>Cargando...</div>
            ) : notificaciones.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: '2rem' }}>🐾</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n.id}
                  style={{ ...styles.item, background: n.leida ? 'white' : '#EEF4FF' }}
                  onClick={() => !n.leida && handleMarcarLeida(n.id)}
                >
                  <div style={styles.itemIcono}>
                    {n.leida ? '📭' : '📬'}
                  </div>
                  <div style={styles.itemCuerpo}>
                    <p style={styles.itemTitulo}>{n.titulo}</p>
                    <p style={styles.itemMensaje}>{n.mensaje}</p>
                    <span style={styles.itemFecha}>{formatearFecha(n.fecha)}</span>
                  </div>
                  {!n.leida && <div style={styles.puntito} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { position: 'relative' },
  campana: { background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '1.1rem', color: 'white', position: 'relative', transition: 'background 0.2s' },
  badge: { position: 'absolute', top: '-4px', right: '-4px', background: '#E53935', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  panel: { position: 'absolute', top: '110%', right: 0, width: '320px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(10,36,99,0.18)', zIndex: 999, overflow: 'hidden' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #EEF4FF' },
  panelTitulo: { color: 'var(--aria-azul-oscuro)', fontWeight: '700', fontSize: '0.95rem' },
  btnTodas: { background: 'none', border: 'none', color: 'var(--aria-azul)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' },
  lista: { maxHeight: '360px', overflowY: 'auto' },
  empty: { padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  item: { display: 'flex', gap: '0.75rem', padding: '0.85rem 1rem', cursor: 'pointer', borderBottom: '1px solid #F5F5F5', transition: 'background 0.15s', alignItems: 'flex-start' },
  itemIcono: { fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' },
  itemCuerpo: { flex: 1 },
  itemTitulo: { color: 'var(--aria-azul-oscuro)', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 0.2rem' },
  itemMensaje: { color: '#666', fontSize: '0.8rem', margin: '0 0 0.3rem', lineHeight: 1.4 },
  itemFecha: { color: '#aaa', fontSize: '0.75rem' },
  puntito: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--aria-azul)', flexShrink: 0, marginTop: '4px' },
};
