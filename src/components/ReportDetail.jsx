// Issue #13 - UI: Modal de Detalles del Animal + cambio de estado
export default function ReportDetail({ reporte, onClose, onCambiarEstado }) {
  if (!reporte) return null;

  const estadoConfig = {
    urgente:      { color: '#C62828', bg: '#FFEBEE', label: '🚨 Urgente' },
    'en proceso': { color: '#E65100', bg: '#FFF3E0', label: '🔄 En proceso' },
    rescatado:    { color: '#2E7D32', bg: '#E8F5E9', label: '✅ Rescatado' },
  };
  const cfg = estadoConfig[reporte.estado] || estadoConfig['en proceso'];
  const yaRescatado = reporte.estado === 'rescatado';

  const handleRescatar = () => {
    if (yaRescatado) return;
    onCambiarEstado(reporte.id, 'rescatado');
  };

  const handleCompartir = () => {
    const texto = `🐾 Animal en situación de calle: ${reporte.especie} en ${reporte.ubicacion}. ¡Ayuda a rescatarlo!`;
    if (navigator.share) {
      navigator.share({ title: 'ARIA - Reporte de rescate', text: texto });
    } else {
      navigator.clipboard?.writeText(texto).then(() => alert('Información copiada al portapapeles 📋'));
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>

        <img src={reporte.foto} alt={reporte.especie} style={styles.img} />

        <div style={styles.body}>
          <div style={styles.topRow}>
            <h2 style={styles.especie}>{reporte.especie}</h2>
            <span style={{ ...styles.badge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>

          <p style={styles.descripcion}>{reporte.descripcion}</p>

          <div style={styles.infoRow}>📍 <span>{reporte.ubicacion}</span></div>
          <div style={styles.infoRow}>👤 <span>Reportado por {reporte.reportadoPor}</span></div>
          <div style={styles.infoRow}>📅 <span>{reporte.fecha}</span></div>

          <div style={styles.actions}>
            <button
              style={{
                ...styles.btnRescatar,
                opacity: yaRescatado ? 0.6 : 1,
                cursor: yaRescatado ? 'not-allowed' : 'pointer',
                background: yaRescatado ? '#A5D6A7' : 'linear-gradient(90deg,#1565C0,#0097A7)',
              }}
              onClick={handleRescatar}
              disabled={yaRescatado}
            >
              {yaRescatado ? '✅ Ya fue rescatado' : '🐾 Yo lo rescato'}
            </button>
            <button style={styles.btnCompartir} onClick={handleCompartir}>
              📤 Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(10,36,99,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(3px)' },
  modal: { background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 60px rgba(10,36,99,0.25)', animation: 'slideUp 0.25s ease' },
  closeBtn: { position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', fontSize: '0.9rem', cursor: 'pointer', zIndex: 1 },
  img: { width: '100%', height: '240px', objectFit: 'cover', display: 'block' },
  body: { padding: '1.5rem' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  especie: { color: '#0A2463', fontSize: '1.3rem', fontWeight: '800', margin: 0 },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' },
  descripcion: { color: '#444', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1rem' },
  infoRow: { color: '#666', fontSize: '0.85rem', marginBottom: '0.4rem', display: 'flex', gap: '0.4rem' },
  actions: { display: 'flex', gap: '0.75rem', marginTop: '1.25rem' },
  btnRescatar: { flex: 1, padding: '0.8rem', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.2s' },
  btnCompartir: { flex: 1, padding: '0.8rem', background: '#F0F6FF', color: '#1565C0', border: '1.5px solid #BBDEFB', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' },
};
