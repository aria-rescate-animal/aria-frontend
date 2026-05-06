import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:3000/api/auth';

export default function ResetPassword() {
  const [params]          = useSearchParams();
  const token             = params.get('token') || '';
  const [form, setForm]   = useState({ contrasena: '', confirmar: '' });
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [exito, setExito]     = useState(false);
  const navigate = useNavigate();

  if (!token) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ ...s.iconWrap, background: '#fef2f2' }}>
          <AlertCircle size={28} color="#dc2626" />
        </div>
        <h1 style={s.titulo}>Enlace inválido</h1>
        <p style={s.subtitulo}>Este enlace de recuperación no es válido o ha expirado.</p>
        <Link to="/recuperar" style={s.btnPrimario}>Solicitar nuevo enlace</Link>
      </div>
    </div>
  );

  if (exito) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ ...s.iconWrap, background: '#f0fdf4' }}>
          <CheckCircle2 size={28} color="#16a34a" />
        </div>
        <h1 style={s.titulo}>Contraseña actualizada</h1>
        <p style={s.subtitulo}>Tu contraseña fue cambiada correctamente. Ya puedes iniciar sesión.</p>
        <Link to="/login" style={s.btnPrimario}>Iniciar sesión</Link>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.contrasena.length < 8) { setError('Mínimo 8 caracteres'); return; }
    if (form.contrasena !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }
    try {
      setLoading(true);
      await axios.post(`${API}/reset-password`, { token, contrasena: form.contrasena });
      setExito(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar. El enlace puede haber expirado.');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          <Lock size={28} color="#2563eb" />
        </div>
        <h1 style={s.titulo}>Nueva contraseña</h1>
        <p style={s.subtitulo}>Ingresa y confirma tu nueva contraseña.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={s.label}>Nueva contraseña</label>
            <div style={{ position: 'relative', marginTop: '0.3rem' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type={showPw ? 'text' : 'password'}
                value={form.contrasena}
                onChange={e => { setForm(f => ({ ...f, contrasena: e.target.value })); setError(''); }}
                placeholder="Mínimo 8 caracteres"
                style={{ ...s.input, paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={s.eyeBtn}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={s.label}>Confirmar contraseña</label>
            <div style={{ position: 'relative', marginTop: '0.3rem' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type={showPw2 ? 'text' : 'password'}
                value={form.confirmar}
                onChange={e => { setForm(f => ({ ...f, confirmar: e.target.value })); setError(''); }}
                placeholder="Repite tu contraseña"
                style={{ ...s.input, paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPw2(v => !v)} style={s.eyeBtn}>
                {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '0.75rem', margin: 0, textAlign: 'left' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ ...s.btnPrimario, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', marginTop: '0.25rem' }}>
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', textAlign: 'center' },
  iconWrap: { width: '56px', height: '56px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' },
  titulo: { margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' },
  subtitulo: { margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151', display: 'block', textAlign: 'left' },
  input: { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  btnPrimario: { width: '100%', padding: '0.8rem', background: '#2563eb', color: 'white', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'block', textAlign: 'center', textDecoration: 'none' },
};
