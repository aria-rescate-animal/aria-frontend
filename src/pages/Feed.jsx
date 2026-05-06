import { useState, useEffect } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerReportes, actualizarEstado } from '../services/reportes.service';
import mockReportes from '../data/mockData';
import Card from '../components/Card';
import ReportDetail from '../components/ReportDetail';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const FILTROS = [
  { value: 'todos',      label: 'Todos' },
  { value: 'urgente',    label: 'Urgente' },
  { value: 'en proceso', label: 'En proceso' },
  { value: 'rescatado',  label: 'Rescatado' },
];

export default function Feed() {
  const { esCiudadano } = useAuth();
  const [reportes, setReportes]                   = useState([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [filtro, setFiltro]                       = useState('todos');
  const [cargando, setCargando]                   = useState(true);
  const [usandoMock, setUsandoMock]               = useState(false);

  useEffect(() => { cargarReportes(); }, []);

  const cargarReportes = async () => {
    try {
      setCargando(true);
      setReportes(await obtenerReportes());
      setUsandoMock(false);
    } catch {
      setReportes(mockReportes);
      setUsandoMock(true);
    } finally { setCargando(false); }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    setReportes(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    if (reporteSeleccionado?.id === id) setReporteSeleccionado(prev => ({ ...prev, estado: nuevoEstado }));
    if (!usandoMock) {
      try { await actualizarEstado(id, nuevoEstado); } catch { /* silencioso */ }
    }
  };

  const filtrados = filtro === 'todos' ? reportes : reportes.filter(r => r.estado === filtro);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
            {esCiudadano ? 'Feed de casos' : 'Gestión de casos'}
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            {filtrados.length} reporte{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={cargarReportes} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'white', border: '1px solid #e2e8f0', color: '#64748b',
            padding: '0.5rem 0.875rem', borderRadius: '8px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: '500'
          }}>
            <RefreshCw size={14} /> Actualizar
          </button>
          {esCiudadano && (
            <a href="/nuevo-reporte" style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: '#2563eb', color: 'white',
              padding: '0.5rem 1rem', borderRadius: '8px',
              textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
            }}>
              <Plus size={15} /> Nuevo reporte
            </a>
          )}
        </div>
      </div>

      {/* Aviso mock */}
      {usandoMock && (
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Mostrando datos de ejemplo — el servidor no esta disponible
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {FILTROS.map(f => (
          <button key={f.value} onClick={() => setFiltro(f.value)} style={{
            padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600',
            cursor: 'pointer', border: '1px solid',
            background:    filtro === f.value ? '#2563eb' : 'white',
            color:         filtro === f.value ? 'white'   : '#64748b',
            borderColor:   filtro === f.value ? '#2563eb' : '#e2e8f0',
            transition: 'all 0.15s'
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {cargando ? <Spinner /> : filtrados.length === 0 ? <EmptyState /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filtrados.map(r => <Card key={r.id} reporte={r} onClick={setReporteSeleccionado} />)}
        </div>
      )}

      {/* Modal */}
      {reporteSeleccionado && (
        <ReportDetail
          reporte={reporteSeleccionado}
          onClose={() => setReporteSeleccionado(null)}
          onCambiarEstado={handleCambiarEstado}
        />
      )}
    </div>
  );
}
