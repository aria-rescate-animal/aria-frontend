import { useState } from 'react';
import { User, Mail, Shield, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { patchPerfil } from '../services/auth.service';

export default function Perfil() {
  const { user, login } = useAuth();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre]     = useState(user?.nombre || '');
  const [loading, setLoading]   = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError]       = useState('');

  const handleGuardar = async () => {
    if (!nombre.trim() || nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await patchPerfil(nombre.trim());
      const token = localStorage.getItem('token');
      login(token, { ...user, nombre: data.user.nombre });
      setEditando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar los cambios. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setEditando(false);
    setNombre(user?.nombre || '');
    setError('');
  };

  const ROL_LABELS = {
    ciudadano:     { label: 'Ciudadano',     bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    entidad:       { label: 'Entidad',       bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    administrador: { label: 'Administrador', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  };
  const rolInfo = ROL_LABELS[user?.rol] || ROL_LABELS.ciudadano;

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Mi perfil</h1>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

        <div style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.75rem', fontWeight: '800', color: 'white', backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.3)' }}>
            {(user?.nombre || 'U')[0].toUpperCase()}
          </div>
          <h2 style={{ margin: 0, color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>{user?.nombre}</h2>
          <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.75rem', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600' }}>
            {rolInfo.label}
          </span>
        </div>

        <div style={{ padding: '1.5rem' }}>

          {guardado && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', color: '#16a34a', fontSize: '0.8rem', fontWeight: '600' }}>
              <Save size={14} /> Perfil actualizado correctamente
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.8rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={s.label}><User size={13} color="#2563eb" /> Nombre completo</label>
              {editando ? (
                <input value={nombre} onChange={e => { setNombre(e.target.value); setError(''); }}
                  style={s.input} disabled={loading} autoFocus />
              ) : (
                <p style={s.valor}>{user?.nombre}</p>
              )}
            </div>
            <div>
              <label style={s.label}><Mail size={13} color="#2563eb" /> Correo electronico</label>
              <p style={{ ...s.valor, color: '#94a3b8' }}>{user?.email}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>El correo no puede modificarse</p>
            </div>
            <div>
              <label style={s.label}><Shield size={13} color="#2563eb" /> Rol en la plataforma</label>
              <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: rolInfo.bg, color: rolInfo.color, border: `1px solid ${rolInfo.border}`, borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', marginTop: '0.3rem' }}>
                {rolInfo.label}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            {!editando ? (
              <button onClick={() => setEditando(true)} style={s.btnPrimario}>
                <Edit2 size={14} /> Editar perfil
              </button>
            ) : (
              <>
                <button onClick={handleGuardar} disabled={loading} style={{ ...s.btnPrimario, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  <Save size={14} /> {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button onClick={handleCancelar} disabled={loading} style={s.btnSecundario}>
                  <X size={14} /> Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  label:        { display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  valor:        { margin: 0, color: '#0f172a', fontSize: '0.9rem', fontWeight: '500', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' },
  input:        { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #2563eb', borderRadius: '10px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' },
  btnPrimario:  { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' },
  btnSecundario:{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' },
};
