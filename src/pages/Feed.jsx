import { useState } from 'react';
import mockReportes from '../data/mockData';
import Card from '../components/Card';
import ReportDetail from '../components/ReportDetail';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Feed() {
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [cargando] = useState(false);

  const filtrados = filtro === 'todos'
    ? mockReportes
    : mockReportes.filter((r) => r.estado === filtro);

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>🐾 Feed de Rescates</h1>
            <p style={styles.subtitle}>{filtrados.length} reporte{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</p>
          </div>
          <a href="/nuevo-reporte" style={styles.btnNuevo}>+ Nuevo reporte</a>
        </div>

        {/* Filtros */}
        <div style={styles.filtros}>
          {['todos', 'urgente', 'en proceso', 'rescatado'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{ ...styles.filtroBtn, background: filtro === f ? '#1565C0' : 'white', color: filtro === f ? 'white' : '#1565C0', border: '1.5px solid #1565C0' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {cargando ? (
          <Spinner />
        ) : filtrados.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={styles.grid}>
            {filtrados.map((r) => (
              <Card key={r.id} reporte={r} onClick={setReporteSeleccionado} />
            ))}
          </div>
        )}
      </main>

      {reporteSeleccionado && (
        <ReportDetail reporte={reporteSeleccionado} onClose={() => setReporteSeleccionado(null)} />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#F0F6FF', fontFamily: 'system-ui, sans-serif' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' },
  title: { color: '#0A2463', fontSize: '1.7rem', fontWeight: '800', margin: 0 },
  subtitle: { color: '#888', fontSize: '0.88rem', margin: '0.2rem 0 0' },
  btnNuevo: { background: 'linear-gradient(90deg,#1565C0,#0097A7)', color: 'white', padding: '0.7rem 1.4rem', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(21,101,192,0.3)' },
  filtros: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filtroBtn: { padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' },
};
