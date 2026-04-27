// Issue #13 - UI: Modal de Detalles del Animal + cambio de estado
export default function ReportDetail({ reporte, onClose, onCambiarEstado }) {
  if (!reporte) return null;

  const estadoConfig = {
    urgente:      { color: 'var(--aria-urgente-color)', bg: 'var(--aria-urgente-bg)', label: '🚨 Urgente' },
    'en proceso': { color: 'var(--aria-proceso-color)', bg: 'var(--aria-proceso-bg)', label: '🔄 En proceso' },
    rescatado:    { color: 'var(--aria-rescatado-color)', bg: 'var(--aria-rescatado-bg)', label: '✅ Rescatado' },
  };
  const cfg = estadoConfig[reporte.estado] || estadoConfig['en proceso'];
  const yaRescatado = reporte.estado === 'rescatado';

  const handleCompartir = () => {
    const texto = `🐾 Animal en situación de calle: ${reporte.especie} en ${reporte.ubicacion}. ¡Ayuda a rescatarlo!`;
    if (navigator.share) {
      navigator.share({ title: 'ARIA - Reporte de rescate', text: texto });
    } else {
      navigator.clipboard?.writeText(texto).then(() => alert('Información copiada 📋'));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <img src={reporte.foto} alt={reporte.especie} className="modal-img" />
        <div className="modal-body">
          <div className="modal-top-row">
            <h2 className="modal-especie">{reporte.especie}</h2>
            <span className="modal-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          <p className="modal-descripcion">{reporte.descripcion}</p>
          <div className="modal-info-row">📍 <span>{reporte.ubicacion}</span></div>
          <div className="modal-info-row">👤 <span>Reportado por {reporte.reportadoPor}</span></div>
          <div className="modal-info-row">📅 <span>{reporte.fecha}</span></div>
          <div className="modal-actions">
            <button
              className="modal-btn-rescatar"
              style={{
                opacity: yaRescatado ? 0.6 : 1,
                cursor: yaRescatado ? 'not-allowed' : 'pointer',
                background: yaRescatado ? '#A5D6A7' : 'var(--aria-gradient-btn)',
              }}
              onClick={() => !yaRescatado && onCambiarEstado(reporte.id, 'rescatado')}
              disabled={yaRescatado}
            >
              {yaRescatado ? '✅ Ya fue rescatado' : '🐾 Yo lo rescato'}
            </button>
            <button className="modal-btn-compartir" onClick={handleCompartir}>📤 Compartir</button>
          </div>
        </div>
      </div>
    </div>
  );
}
