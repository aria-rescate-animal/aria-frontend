import { Link } from 'react-router-dom';
import { PawPrint, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EmptyState() {
  const { esCiudadano } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', gap: '1rem', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PawPrint size={28} color="#2563eb" strokeWidth={1.5} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>
          Sin reportes activos
        </h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', maxWidth: '320px', lineHeight: 1.6 }}>
          {esCiudadano
            ? 'No hay reportes en este momento. Si ves un animal en peligro, puedes crear el primer reporte.'
            : 'No hay casos activos que atender en este momento.'}
        </p>
      </div>
      {esCiudadano && (
        <Link to="/nuevo-reporte" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: '#2563eb', color: 'white',
          padding: '0.6rem 1.25rem', borderRadius: '10px',
          textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600',
          boxShadow: '0 2px 8px rgba(37,99,235,0.25)', marginTop: '0.5rem'
        }}>
          <Plus size={15} /> Crear reporte
        </Link>
      )}
    </div>
  );
}
