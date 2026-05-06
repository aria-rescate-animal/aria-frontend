import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://localhost:3000/api/auth';

export default function VerificarOTP() {
  const [codigos, setCodigos] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [reenvioOk, setReenvioOk] = useState(false);
  const [success, setSuccess]  = useState(false);
  const refs = useRef([]);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // El email viene desde el register via state
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
    refs.current[0]?.focus();
  }, [email]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const nuevos = [...codigos];
    nuevos[i] = val.slice(-1);
    setCodigos(nuevos);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !codigos[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (texto.length === 6) {
      setCodigos(texto.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleVerificar = async () => {
    const codigo = codigos.join('');
    if (codigo.length < 6) { setError('Ingresa los 6 digitos del codigo'); return; }
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.post(`${API}/verificar-otp`, { email, codigo });

      if (data.pendienteAprobacion) {
        setSuccess(true);
        return;
      }

      if (data.token) {
        login(data.token, data.user);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Codigo invalido. Intentalo de nuevo.');
      setCodigos(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleReenviar = async () => {
    try {
      setReenvioOk(false);
      await axios.post(`${API}/reenviar-otp`, { email });
      setReenvioOk(true);
      setCodigos(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } catch { setError('No se pudo reenviar el codigo.'); }
  };

  if (success) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <CheckCircle2 size={28} color="#2563eb" />
          </div>
          <h2 style={s.titulo}>Correo verificado</h2>
          <p style={s.subtitulo}>Tu cuenta esta pendiente de aprobacion por un administrador. Te notificaremos cuando sea aprobada.</p>
          <Link to="/login" style={s.btnPrimario}>Ir a iniciar sesion</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#2563eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={18} color="white" />
          </div>
          <div>
            <h1 style={s.titulo}>Verifica tu correo</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              Codigo enviado a <strong style={{ color: '#374151' }}>{email}</strong>
            </p>
          </div>
        </div>

        <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Ingresa el codigo de 6 digitos que enviamos a tu correo. Expira en 15 minutos.
        </p>

        {/* Inputs OTP */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handlePaste}>
          {codigos.map((d, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1}
              style={{
                width: '48px', height: '56px', textAlign: 'center',
                fontSize: '1.5rem', fontWeight: '700', color: '#0f172a',
                border: `2px solid ${d ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '12px', outline: 'none',
                background: d ? '#eff6ff' : 'white',
                transition: 'all 0.15s'
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '0.75rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {reenvioOk && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '10px', padding: '0.75rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'center' }}>
            Nuevo codigo enviado a tu correo
          </div>
        )}

        <button
          onClick={handleVerificar}
          disabled={loading || codigos.join('').length < 6}
          style={{ ...s.btnPrimario, opacity: (loading || codigos.join('').length < 6) ? 0.6 : 1, cursor: (loading || codigos.join('').length < 6) ? 'not-allowed' : 'pointer', marginBottom: '0.75rem' }}
        >
          {loading ? 'Verificando...' : 'Verificar cuenta'}
        </button>

        <button onClick={handleReenviar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%', background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.65rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>
          <RefreshCw size={13} /> Reenviar codigo
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none' }}>
            <ArrowLeft size={13} /> Volver al registro
          </Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  titulo: { margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' },
  subtitulo: { color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, margin: '0.5rem 0 1.5rem' },
  btnPrimario: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', transition: 'background 0.15s' },
};
