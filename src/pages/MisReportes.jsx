import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Clock, CheckCircle2,
  MapPin, ChevronLeft, ChevronRight,
  Plus, RefreshCw, FileText
} from 'lucide-react';
import { obtenerMisReportes } from '../services/reportes.service';
import ReportDetail from '../components/ReportDetail';

const ESTADO = {
  urgente:      { label: 'Urgente',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: AlertTriangle },
  'en proceso': { label: 'En proceso', color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  rescatado:    { label: 'Rescatado',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
};

const formatFecha = (f) => {
  if (!f) return '';
  return new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function MisReportes() {
  const navigate = useNavigate();
  const [reportes, setReportes]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [pagina, setPagina]             = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal]               = useState(0);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => { cargar(pagina); }, [pagina]);

  const cargar = async (page) => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerMisReportes(page);
      setReportes(data.reportes);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
    } catch {
      setError('No se pudieron cargar tus reportes. Verifica tu conexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = (id, nuevoEstado) => {
    setReportes(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    if (seleccionado?.id === id) setSeleccionado(prev => ({ ...prev, estado: nuevoEstado }));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Mis reportes</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            {total} reporte{total !== 1 ? 's' : ''} enviado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => cargar(pagina)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.5rem 0.875rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Actualizar
          </button>
          <button onClick={() => navigate('/nuevo-reporte')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={15} /> Nuevo reporte
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Cargando tus reportes...</p>
        </div>

      ) : reportes.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '4rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FileText size={24} color="#94a3b8" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: '700' }}>Aun no tienes reportes</h3>
          <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
            Cuando reportes un animal en situacion de calle, aparecera aqui.
          </p>
          <button onClick={() => navigate('/nuevo-reporte')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#2563eb', color: 'white', padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' }}>
            <Plus size={15} /> Crear primer reporte
          </button>
        </div>

      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reportes.map(r => {
            const cfg  = ESTADO[r.estado] || ESTADO['urgente'];
            const Icon = cfg.Icon;
            return (
              <div key={r.id} onClick={() => setSeleccionado(r)}
                style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ width: '120px', flexShrink: 0, background: '#f8fafc', overflow: 'hidden' }}>
                  <img src={r.foto || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=140&fit=crop'} alt={r.especie}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=140&fit=crop'; }} />
                </div>
                <div style={{ flex: 1, padding: '1rem', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{r.especie}</h3>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.55rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '700', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>{formatFecha(r.fecha)}</span>
                  </div>
                  <p style={{ margin: '0 0 0.6rem', color: '#475569', fontSize: '0.825rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.descripcion}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.8rem' }}>
                      <MapPin size={13} color="#2563eb" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.ubicacion}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', flexShrink: 0 }}>Ver detalle →</span>
                  </div>
                </div>
              </div>
            );
          })}

          {totalPaginas > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', cursor: pagina === 1 ? 'not-allowed' : 'pointer', opacity: pagina === 1 ? 0.5 : 1, fontSize: '0.8rem' }}>
                <ChevronLeft size={14} /> Anterior
              </button>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pagina {pagina} de {totalPaginas}</span>
              <button disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer', opacity: pagina === totalPaginas ? 0.5 : 1, fontSize: '0.8rem' }}>
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {seleccionado && (
        <ReportDetail reporte={seleccionado} onClose={() => setSeleccionado(null)} onCambiarEstado={handleCambiarEstado} />
      )}
    </div>
  );
}
