import { X, MapPin, User, Calendar, HeartPulse, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ESTADO = {
  urgente:      { label: 'Urgente',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: AlertTriangle },
  'en proceso': { label: 'En proceso', color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  rescatado:    { label: 'Rescatado',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop';

export default function ReportDetail({ reporte, onClose, onCambiarEstado }) {
  if (!reporte) return null;

  const { puedeRescatar } = useAuth();
  const cfg        = ESTADO[reporte.estado] || ESTADO['urgente'];
  const EstadoIcon = cfg.Icon;
  const yaRescatado = reporte.estado === 'rescatado';
  const enProceso   = reporte.estado === 'en proceso';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reporte.ubicacion || '')}`;

  const formatFecha = (f) => {
    if (!f) return '';
    return new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '20px',
          width: '100%', maxWidth: '480px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        {/* Imagen */}
        <div style={{ position: 'relative' }}>
          <img
            src={reporte.foto || PLACEHOLDER}
            alt={reporte.especie}
            style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.src = PLACEHOLDER; }}
          />
          {/* Badge estado */}
          <span style={{
            position: 'absolute', top: '1rem', left: '1rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.3rem 0.75rem', borderRadius: '99px',
            fontSize: '0.75rem', fontWeight: '700',
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`
          }}>
            <EstadoIcon size={12} /> {cfg.label}
          </span>
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.9)', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <X size={15} color="#374151" />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
            {reporte.especie}
          </h2>
          <p style={{ margin: '0 0 1.25rem', color: '#475569', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {reporte.descripcion}
          </p>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#374151' }}>
              <MapPin size={14} color="#2563eb" />
              <span>{reporte.ubicacion}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#374151' }}>
              <User size={14} color="#2563eb" />
              <span>Reportado por {reporte.reportadoPor}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#94a3b8' }}>
              <Calendar size={14} />
              <span>{formatFecha(reporte.fecha)}</span>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {puedeRescatar ? (
              <>
                {/* Botón primario — solo si no está rescatado */}
                {!yaRescatado && (
                  <button
                    onClick={() => onCambiarEstado(reporte.id, enProceso ? 'rescatado' : 'en proceso')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.8rem', background: '#2563eb', color: 'white',
                      border: 'none', borderRadius: '12px', fontWeight: '700',
                      fontSize: '0.9rem', cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
                    onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
                  >
                    <HeartPulse size={16} />
                    {enProceso ? 'Marcar como rescatado' : 'Atender emergencia'}
                  </button>
                )}

                {/* Mensaje si ya fue rescatado */}
                {yaRescatado && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1rem', background: '#f0fdf4',
                    border: '1px solid #bbf7d0', borderRadius: '12px',
                    color: '#16a34a', fontSize: '0.875rem', fontWeight: '600'
                  }}>
                    <CheckCircle2 size={16} />
                    Este caso fue rescatado exitosamente
                  </div>
                )}

                {/* Botón secundario — Ver ruta en mapa */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', background: 'white', color: '#374151',
                    border: '1px solid #e2e8f0', borderRadius: '12px',
                    fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <MapPin size={15} color="#2563eb" />
                  Ver ruta en mapa
                </a>
              </>
            ) : (
              /* Ciudadano — solo ver mapa */
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1rem', background: '#eff6ff',
                  border: '1px solid #bfdbfe', borderRadius: '12px',
                  color: '#1d4ed8', fontSize: '0.875rem'
                }}>
                  <HeartPulse size={15} />
                  Una entidad registrada atendera este caso
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', background: 'white', color: '#374151',
                    border: '1px solid #e2e8f0', borderRadius: '12px',
                    fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none'
                  }}
                >
                  <MapPin size={15} color="#2563eb" />
                  Ver ubicacion en mapa
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
