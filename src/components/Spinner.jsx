// Issue #15 - UI: Componentes de Feedback
// Issue #15 - UI: Componentes de Feedback
export default function Spinner() {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
      <div style={styles.spinner} />
      <p style={styles.text}>Cargando rescates...</p>
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' },
  spinner: { width: '48px', height: '48px', border: '5px solid #BBDEFB', borderTopColor: '#1565C0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' },
  text: { color: '#888', fontSize: '0.9rem', animation: 'pulse 1.5s ease infinite' },
};
