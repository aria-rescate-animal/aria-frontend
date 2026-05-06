import { MapPin, User, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const ESTADO = {
  urgente:      { label: 'Urgente',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', Icon: AlertTriangle },
  'en proceso': { label: 'En proceso', color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  rescatado:    { label: 'Rescatado',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=280&fit=crop';

export default function Card({ reporte, onClick }) {
  const cfg  = ESTADO[reporte.estado] || ESTADO['urgente'];
  const Icon = cfg.Icon;

  const formatFecha = (f) => {
    if (!f) return '';
    return new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div
      onClick={() => onClick(reporte)}
      style={{
        background: 'white', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid #e2e8f0', cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s, transform 0.2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Imagen */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#f8fafc' }}>
        <img
          src={reporte.foto || PLACEHOLDER}
          alt={reporte.especie}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.src = PLACEHOLDER; }}
        />
        <span style={{
          position: 'absolute', top: '0.75rem', left: '0.75rem',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.25rem 0.65rem', borderRadius: '99px',
          fontSize: '0.72rem', fontWeight: '700',
          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        }}>
          <Icon size={11} /> {cfg.label}
        </span>
      </div>

      {/* Cuerpo */}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{reporte.especie}</h3>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{formatFecha(reporte.fecha)}</span>
        </div>

        <p style={{
          margin: '0 0 0.75rem', color: '#475569', fontSize: '0.825rem', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {reporte.descripcion}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.875rem', color: '#64748b', fontSize: '0.8rem' }}>
          <MapPin size={13} color="#2563eb" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reporte.ubicacion}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.75rem' }}>
            <User size={12} /> {reporte.reportadoPor}
          </div>
          <span style={{
            background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
            padding: '0.25rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600'
          }}>
            Ver detalle
          </span>
        </div>
      </div>
    </div>
  );
}
