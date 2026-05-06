import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, ClipboardList, AlertTriangle, BarChart3,
  FileText, Layers, Plus, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerReportes } from '../services/reportes.service';

export default function Dashboard() {
  const { user, puedeRescatar } = useAuth();
  const [stats, setStats]       = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setCargando(true);
        const reportes   = await obtenerReportes();
        const rescatados = reportes.filter(r => r.estado === 'rescatado').length;
        const activos    = reportes.filter(r => r.estado === 'urgente' || r.estado === 'en proceso').length;
        const urgentes   = reportes.filter(r => r.estado === 'urgente').length;
        const misR       = reportes.filter(r => r.usuario_id === user?.id).length;
        setStats({ rescatados, activos, urgentes, total: reportes.length, misReportes: misR });
      } catch {
        setStats({ rescatados: 0, activos: 0, urgentes: 0, total: 0, misReportes: 0 });
      } finally { setCargando(false); }
    };
    load();
  }, [user?.id]);

  const statCards = puedeRescatar ? [
    { Icon: CheckCircle2,  label: 'Rescatados',     value: stats?.rescatados, color: '#16a34a', bg: '#f0fdf4', iconBg: '#dcfce7' },
    { Icon: ClipboardList, label: 'Casos activos',   value: stats?.activos,    color: '#2563eb', bg: '#eff6ff', iconBg: '#dbeafe' },
    { Icon: AlertTriangle, label: 'Urgentes',        value: stats?.urgentes,   color: '#dc2626', bg: '#fef2f2', iconBg: '#fee2e2' },
    { Icon: BarChart3,     label: 'Total reportes',  value: stats?.total,      color: '#7c3aed', bg: '#f5f3ff', iconBg: '#ede9fe' },
  ] : [
    { Icon: FileText,      label: 'Mis reportes',      value: stats?.misReportes, color: '#2563eb', bg: '#eff6ff', iconBg: '#dbeafe' },
    { Icon: Layers,        label: 'Total plataforma',  value: stats?.total,       color: '#7c3aed', bg: '#f5f3ff', iconBg: '#ede9fe' },
    { Icon: CheckCircle2,  label: 'Rescatados',        value: stats?.rescatados,  color: '#16a34a', bg: '#f0fdf4', iconBg: '#dcfce7' },
    { Icon: AlertTriangle, label: 'Urgentes ahora',    value: stats?.urgentes,    color: '#dc2626', bg: '#fef2f2', iconBg: '#fee2e2' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header minimalista */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
          Resumen general
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
          {puedeRescatar
            ? 'Estadísticas operativas del sistema de rescate'
            : 'Seguimiento de tus reportes y el estado general de la plataforma'}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {cargando ? [1,2,3,4].map(i => (
          <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', height: '96px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', width: '60%', marginBottom: '0.75rem' }} />
            <div style={{ height: '28px', background: '#f8fafc', borderRadius: '6px', width: '40%' }} />
          </div>
        )) : statCards.map(card => {
          const Icon = card.Icon;
          return (
            <div key={card.label} style={{
              background: 'white', borderRadius: '16px', padding: '1.5rem',
              border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s',
              cursor: 'default'
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={card.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
                  {card.value ?? 0}
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: puedeRescatar ? '1fr' : '1fr 1fr', gap: '1rem' }}>
        {!puedeRescatar && (
          <Link to="/nuevo-reporte" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#2563eb', color: 'white', borderRadius: '14px',
            padding: '1.25rem 1.5rem', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'all 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>Crear nuevo reporte</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', opacity: 0.8 }}>Reporta un animal en situacion de calle</p>
            </div>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} />
            </div>
          </Link>
        )}

        <Link to="/reportes" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'white', color: '#374151', borderRadius: '14px',
          padding: '1.25rem 1.5rem', textDecoration: 'none',
          border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#bfdbfe'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
              {puedeRescatar ? 'Gestionar casos' : 'Ver feed de casos'}
            </p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              {puedeRescatar ? 'Revisar y atender emergencias activas' : 'Ver todos los reportes de la plataforma'}
            </p>
          </div>
          <ArrowRight size={18} color="#2563eb" />
        </Link>
      </div>
    </div>
  );
}
