const estadoConfig = {
  urgente:    { color: '#C62828', bg: '#FFEBEE', label: '🚨 Urgente' },
  'en proceso': { color: '#E65100', bg: '#FFF3E0', label: '🔄 En proceso' },
  rescatado:  { color: '#2E7D32', bg: '#E8F5E9', label: '✅ Rescatado' },
};

export default function Card({ reporte, onClick }) {
  const cfg = estadoConfig[reporte.estado] || estadoConfig['en proceso'];

  return (
    <div onClick={() => onClick(reporte)} style={styles.card}>
      <div style={styles.imgWrapper}>
        <img src={reporte.foto} alt={reporte.especie} style={styles.img} />
        <span style={{ ...styles.estadoBadge, background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
      <div style={styles.body}>
        <div style={styles.header}>
          <span style={styles.especie}>{reporte.especie}</span>
          <span style={styles.fecha}>{reporte.fecha}</span>
        </div>
        <p style={styles.descripcion}>{reporte.descripcion}</p>
        <div style={styles.ubicacion}>📍 {reporte.ubicacion}</div>
        <div style={styles.footer}>
          <span style={styles.reportadoPor}>👤 {reporte.reportadoPor}</span>
          <button style={styles.verBtn}>Ver detalle →</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: '16px', boxShadow: '0 2px 16px rgba(10,36,99,0.09)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s' },
  imgWrapper: { position: 'relative' },
  img: { width: '100%', height: '180px', objectFit: 'cover', display: 'block' },
  estadoBadge: { position: 'absolute', top: '0.75rem', left: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  body: { padding: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' },
  especie: { fontWeight: '700', color: '#0A2463', fontSize: '1rem' },
  fecha: { color: '#aaa', fontSize: '0.78rem' },
  descripcion: { color: '#555', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 0.6rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  ubicacion: { color: '#666', fontSize: '0.82rem', marginBottom: '0.75rem' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reportadoPor: { color: '#888', fontSize: '0.78rem' },
  verBtn: { background: 'linear-gradient(90deg,#1565C0,#0097A7)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' },
};
