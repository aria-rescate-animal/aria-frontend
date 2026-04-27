// Issue Sprint 2 - Feed conectado con API real + fallback a mockData
import { useState, useEffect } from 'react';
import { obtenerReportes, actualizarEstado } from '../services/reportes.service';
import mockReportes from '../data/mockData';
import Card from '../components/Card';
import ReportDetail from '../components/ReportDetail';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Feed() {
  const [reportes, setReportes] = useState([]);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);

  useEffect(() => { cargarReportes(); }, []);

  const cargarReportes = async () => {
    try {
      setCargando(true);
      const data = await obtenerReportes();
      setReportes(data);
      setUsandoMock(false);
    } catch {
      setReportes(mockReportes);
      setUsandoMock(true);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    setReportes((prev) => prev.map((r) => r.id === id ? { ...r, estado: nuevoEstado } : r));
    if (reporteSeleccionado?.id === id) {
      setReporteSeleccionado((prev) => ({ ...prev, estado: nuevoEstado }));
    }
    if (!usandoMock) {
      try { await actualizarEstado(id, nuevoEstado); } catch { /* silencioso */ }
    }
  };

  const filtrados = filtro === 'todos' ? reportes : reportes.filter((r) => r.estado === filtro);

  return (
    <div className="feed-page">
      <Navbar />
      <main className="feed-main">
        <div className="feed-topbar">
          <div>
            <h1 className="feed-title">🐾 Feed de Rescates</h1>
            <p className="feed-subtitle">{filtrados.length} reporte{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="feed-top-actions">
            <button onClick={cargarReportes} className="feed-btn-refresh" title="Actualizar">🔄</button>
            <a href="/nuevo-reporte" className="feed-btn-nuevo">+ Nuevo reporte</a>
          </div>
        </div>

        {usandoMock && (
          <div className="aria-alert-warning">⚠️ Mostrando datos de prueba — backend no disponible</div>
        )}

        <div className="feed-filtros">
          {['todos', 'urgente', 'en proceso', 'rescatado'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`feed-filtro-btn${filtro === f ? ' active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {cargando ? <Spinner /> : filtrados.length === 0 ? <EmptyState /> : (
          <div className="feed-grid">
            {filtrados.map((r) => (
              <Card key={r.id} reporte={r} onClick={setReporteSeleccionado} />
            ))}
          </div>
        )}
      </main>

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
