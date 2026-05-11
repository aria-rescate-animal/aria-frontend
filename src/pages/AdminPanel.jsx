import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Clock, Users, FileText,
  PawPrint, LogOut, Building2, Phone, MapPin, Link2,
  Shield, Lock, Unlock, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerUsuarios, bloquearUsuario } from '../services/auth.service';
import axios from 'axios';
import { obtenerToken } from '../utils/auth.utils';

const API   = 'http://localhost:3000/api';
const authH = () => ({ headers: { Authorization: `Bearer ${obtenerToken()}` } });

const ROL_BADGE = {
  ciudadano:     { label: 'Ciudadano', bg: '#eff6ff', color: '#1d4ed8' },
  entidad:       { label: 'Entidad',   bg: '#f5f3ff', color: '#6d28d9' },
  administrador: { label: 'Admin',     bg: '#fef2f2', color: '#b91c1c' },
};

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('entidades');

  const [pendientes, setPendientes] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [expandido, setExpandido]   = useState(null);

  const [usuarios, setUsuarios]             = useState([]);
  const [loadingUsers, setLoadingUsers]     = useState(false);
  const [procesandoUser, setProcesandoUser] = useState(null);
  const [paginaUser, setPaginaUser]         = useState(1);
  const [totalPaginasUser, setTotalPaginasUser] = useState(1);
  const [errorUsers, setErrorUsers]         = useState('');

  useEffect(() => { cargarDatos(); }, []);
  useEffect(() => { if (tab === 'usuarios') cargarUsuarios(paginaUser); }, [tab, paginaUser]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        axios.get(`${API}/admin/entidades-pendientes`, authH()),
        axios.get(`${API}/admin/estadisticas`, authH()),
      ]);
      setPendientes(pRes.data);
      setStats(sRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const cargarUsuarios = async (page) => {
    try {
      setLoadingUsers(true);
      setErrorUsers('');
      const data = await obtenerUsuarios(page, 20);
      setUsuarios(data.usuarios);
      setTotalPaginasUser(data.totalPaginas);
    } catch { setErrorUsers('Error al cargar usuarios. Intenta de nuevo.'); }
    finally { setLoadingUsers(false); }
  };

  const handleAccion = async (id, accion) => {
    try {
      setProcesando(id);
      await axios.patch(`${API}/admin/aprobar-entidad/${id}`, { accion }, authH());
      await cargarDatos();
    } catch { alert('Error al procesar la accion'); }
    finally { setProcesando(null); }
  };

  const handleBloquear = async (id, estaActualmenteBloqueado) => {
    const accion = estaActualmenteBloqueado ? 'desbloquear' : 'bloquear';
    try {
      setProcesandoUser(id);
      await bloquearUsuario(id, accion);
      setUsuarios(prev => prev.map(u =>
        u.id === id ? { ...u, bloqueado: accion === 'bloquear' ? 1 : 0 } : u
      ));
    } catch (err) {
      setErrorUsers(err.response?.data?.error || 'Error al realizar la accion');
    } finally { setProcesandoUser(null); }
  };

  const statCards = [
    { Icon: Users,        label: 'Total usuarios',      value: stats?.total_usuarios, bg: '#f0fdfa', color: '#0d9488', iconBg: '#ccfbf1' },
    { Icon: FileText,     label: 'Total reportes',       value: stats?.total_reportes, bg: '#faf5ff', color: '#7c3aed', iconBg: '#ede9fe' },
    { Icon: Clock,        label: 'Entidades pendientes', value: stats?.pendientes,     bg: '#fffbeb', color: '#d97706', iconBg: '#fde68a' },
    { Icon: CheckCircle2, label: 'Animales rescatados',  value: stats?.rescatados,     bg: '#f0fdf4', color: '#16a34a', iconBg: '#dcfce7' },
    { Icon: Lock,         label: 'Usuarios bloqueados',  value: stats?.bloqueados,     bg: '#fef2f2', color: '#dc2626', iconBg: '#fecaca' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
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
            <button onClick={() => { logout(); navigate('/login', { replace: true }); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 1.5rem' }}>Panel de administracion</h1>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { key: 'entidades', label: 'Entidades pendientes', Icon: Shield },
            { key: 'usuarios',  label: 'Gestion de usuarios',  Icon: Users  },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.6rem 1.1rem', borderRadius: '8px 8px 0 0',
              border: '1px solid', borderBottom: tab === t.key ? '1px solid white' : '1px solid #e2e8f0',
              background: tab === t.key ? 'white' : '#f8fafc',
              color: tab === t.key ? '#2563eb' : '#64748b',
              fontWeight: tab === t.key ? '700' : '500',
              fontSize: '0.875rem', cursor: 'pointer',
              marginBottom: tab === t.key ? '-1px' : '0',
            }}>
              <t.Icon size={15} /> {t.label}
              {t.key === 'entidades' && pendientes.length > 0 && (
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.1rem 0.5rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700' }}>
                  {pendientes.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB ENTIDADES */}
        {tab === 'entidades' && (
          <div style={{ background: 'white', borderRadius: '0 16px 16px 16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {loading ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>Cargando...</p>
            ) : pendientes.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '3rem', color: '#94a3b8' }}>
                <CheckCircle2 size={36} color="#16a34a" strokeWidth={1.5} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No hay entidades pendientes de aprobacion</p>
              </div>
            ) : pendientes.map(ent => (
              <div key={ent.id} style={{ borderBottom: '1px solid #f8fafc' }}>
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setExpandido(expandido === ent.id ? null : ent.id)}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem' }}>
                      {expandido === ent.id ? 'Ocultar' : 'Ver detalle'}
                    </button>
                    <button disabled={procesando === ent.id} onClick={() => handleAccion(ent.id, 'aprobar')}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                      <CheckCircle2 size={13} /> {procesando === ent.id ? '...' : 'Aprobar'}
                    </button>
                    <button disabled={procesando === ent.id} onClick={() => handleAccion(ent.id, 'rechazar')}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                      <XCircle size={13} /> Rechazar
                    </button>
                  </div>
                </div>
                {expandido === ent.id && (
                  <div style={{ padding: '0 1.5rem 1rem 5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {ent.telefono_oficial && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#374151' }}><Phone size={13} color="#0d9488" /> {ent.telefono_oficial}</div>}
                    {ent.direccion_sede   && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#374151' }}><MapPin size={13} color="#0d9488" /> {ent.direccion_sede}</div>}
                    {ent.enlace_verificacion && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}><Link2 size={13} color="#0d9488" /><a href={ent.enlace_verificacion} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', textDecoration: 'none' }}>Ver sitio web</a></div>}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Solicitado: {new Date(ent.created_at).toLocaleDateString('es-CO')}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB USUARIOS */}
        {tab === 'usuarios' && (
          <div style={{ background: 'white', borderRadius: '0 16px 16px 16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {errorUsers && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', margin: '1rem 1.5rem', color: '#dc2626', fontSize: '0.8rem' }}>
                <AlertCircle size={14} /> {errorUsers}
              </div>
            )}
            {loadingUsers ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>Cargando usuarios...</p>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Nombre', 'Correo', 'Rol', 'Estado', 'Accion'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => {
                        const rolInfo   = ROL_BADGE[u.rol] || ROL_BADGE.ciudadano;
                        const bloqueado = u.bloqueado === 1;
                        const esMismoAdmin = u.id === user?.id;
                        const esAdmin   = u.rol === 'administrador';
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: bloqueado ? 0.75 : 1 }}>
                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{u.nombre}</td>
                            <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{u.email}</td>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              <span style={{ padding: '0.2rem 0.6rem', background: rolInfo.bg, color: rolInfo.color, borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600' }}>{rolInfo.label}</span>
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', background: bloqueado ? '#fef2f2' : '#f0fdf4', color: bloqueado ? '#dc2626' : '#16a34a' }}>
                                {bloqueado ? <Lock size={11} /> : <CheckCircle2 size={11} />}
                                {bloqueado ? 'Bloqueado' : 'Activo'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              {esMismoAdmin || esAdmin ? (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                              ) : (
                                <button disabled={procesandoUser === u.id} onClick={() => handleBloquear(u.id, bloqueado)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', border: '1px solid', background: bloqueado ? '#f0fdf4' : '#fef2f2', color: bloqueado ? '#16a34a' : '#dc2626', borderColor: bloqueado ? '#bbf7d0' : '#fecaca', opacity: procesandoUser === u.id ? 0.6 : 1 }}>
                                  {procesandoUser === u.id ? '...' : bloqueado ? <><Unlock size={12} /> Desbloquear</> : <><Lock size={12} /> Bloquear</>}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPaginasUser > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <button disabled={paginaUser === 1} onClick={() => setPaginaUser(p => p - 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', cursor: paginaUser === 1 ? 'not-allowed' : 'pointer', opacity: paginaUser === 1 ? 0.5 : 1, fontSize: '0.8rem' }}>
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pagina {paginaUser} de {totalPaginasUser}</span>
                    <button disabled={paginaUser === totalPaginasUser} onClick={() => setPaginaUser(p => p + 1)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#64748b', cursor: paginaUser === totalPaginasUser ? 'not-allowed' : 'pointer', opacity: paginaUser === totalPaginasUser ? 0.5 : 1, fontSize: '0.8rem' }}>
                      Siguiente <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
