import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Clock, Users, FileText,
  PawPrint, LogOut, Building2, Phone, MapPin, Link2, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerToken } from '../utils/auth.utils';
import axios from 'axios';

const API = 'http://localhost:3000/api';
const authH = () => ({ headers: { Authorization: `Bearer ${obtenerToken()}` } });

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [expandido, setExpandido]   = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        axios.get(`${API}/admin/entidades-pendientes`, authH()),
        axios.get(`${API}/admin/estadisticas`, authH()),
      ]);
      setPendientes(pRes.data);
      setStats(sRes.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleAccion = async (id, accion) => {
    try {
      setProcesando(id);
      await axios.patch(`${API}/admin/aprobar-entidad/${id}`, { accion }, authH());
      await cargarDatos();
    } catch { alert('Error al procesar la acción'); }
    finally { setProcesando(null); }
  };

  const statCards = [
    { Icon: Users,       label: 'Total usuarios',      value: stats?.total_usuarios, bg: '#f0fdfa', color: '#0d9488', iconBg: '#ccfbf1' },
    { Icon: FileText,    label: 'Total reportes',       value: stats?.total_reportes, bg: '#faf5ff', color: '#7c3aed', iconBg: '#ede9fe' },
    { Icon: Clock,       label: 'Entidades pendientes', value: stats?.pendientes,     bg: '#fffbeb', color: '#d97706', iconBg: '#fde68a' },
    { Icon: CheckCircle2,label: 'Animales rescatados',  value: stats?.rescatados,     bg: '#f0fdf4', color: '#16a34a', iconBg: '#dcfce7' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #0d9488, #14b8a6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PawPrint size={18} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>ARIA</span>
              <span style={{ marginLeft: '0.5rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>ADMIN</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>{user?.nombre}</span>
            <button onClick={() => { logout(); navigate('/login', { replace: true }); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 1.5rem' }}>Panel de administración</h1>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {statCards.map(c => (
              <div key={c.label} style={{ background: c.bg, borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid ${c.iconBg}` }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <c.Icon size={20} color={c.color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: c.color, lineHeight: 1 }}>{c.value ?? 0}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entidades pendientes */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <Shield size={18} color="#0d9488" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Entidades pendientes de aprobación</h2>
            {pendientes.length > 0 && (
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700' }}>
                {pendientes.length}
              </span>
            )}
          </div>

          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>Cargando...</p>
          ) : pendientes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '3rem', color: '#94a3b8' }}>
              <CheckCircle2 size={36} color="#16a34a" strokeWidth={1.5} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No hay entidades pendientes de aprobación</p>
            </div>
          ) : (
            <div>
              {pendientes.map(ent => (
                <div key={ent.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  {/* Fila principal */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={18} color="#0d9488" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{ent.nombre_organizacion}</p>
                      <p style={{ margin: '0.1rem 0 0', color: '#64748b', fontSize: '0.78rem' }}>
                        {ent.tipo_entidad || 'Sin tipo'} · NIT: {ent.nit} · {ent.email}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setExpandido(expandido === ent.id ? null : ent.id)}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem' }}
                      >
                        {expandido === ent.id ? 'Ocultar' : 'Ver detalle'}
                      </button>
                      <button
                        disabled={procesando === ent.id}
                        onClick={() => handleAccion(ent.id, 'aprobar')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        <CheckCircle2 size={13} />
                        {procesando === ent.id ? '...' : 'Aprobar'}
                      </button>
                      <button
                        disabled={procesando === ent.id}
                        onClick={() => handleAccion(ent.id, 'rechazar')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        <XCircle size={13} />
                        Rechazar
                      </button>
                    </div>
                  </div>

                  {/* Detalle expandible */}
                  {expandido === ent.id && (
                    <div style={{ padding: '0 1.5rem 1rem 5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {ent.telefono_oficial && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#374151' }}>
                          <Phone size={13} color="#0d9488" /> {ent.telefono_oficial}
                        </div>
                      )}
                      {ent.direccion_sede && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#374151' }}>
                          <MapPin size={13} color="#0d9488" /> {ent.direccion_sede}
                        </div>
                      )}
                      {ent.enlace_verificacion && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                          <Link2 size={13} color="#0d9488" />
                          <a href={ent.enlace_verificacion} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>
                            Ver sitio web
                          </a>
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Solicitado: {new Date(ent.created_at).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
