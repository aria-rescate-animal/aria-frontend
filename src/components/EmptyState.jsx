// Issue #15 - UI: Componentes de Feedback
// Issue #15 - UI: Componentes de Feedback
export default function EmptyState() {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <span style={styles.icon}>🐶</span>
      <h3 style={styles.title}>No hay emergencias activas</h3>
      <p style={styles.text}>¡Buenas noticias! Por ahora no hay animales en situación de riesgo reportados. Si ves uno, repórtalo.</p>
      <a href="/nuevo-reporte" style={styles.btn}>+ Crear primer reporte</a>
    </div>
  );
}

const styles = {
  wrapper: { textAlign: 'center', padding: '4rem 1rem' },
  icon: { fontSize: '5rem', display: 'block', marginBottom: '1rem', animation: 'float 2.5s ease-in-out infinite' },
  title: { color: '#0A2463', fontSize: '1.2rem', fontWeight: '700', margin: '0 0 0.5rem' },
  text: { color: '#888', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 1.5rem', lineHeight: '1.6' },
  btn: { display: 'inline-block', background: 'linear-gradient(90deg,#1565C0,#0097A7)', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' },
};
