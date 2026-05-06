import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:3000/api/auth';

export default function VerificarCodigo() {
  const [codigo, setCodigo]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [reenviando, setReenviando]   = useState(false);
  const [reenviadoOk, setReenviadoOk] = useState(false);
  const [countdown, setCountdown]     = useState(0);
  const inputsRef = useRef([]);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const email    = location.state?.email || '';
  const pendiente = location.state?.pendiente || false;

  useEffect(() => {
    if (!email) { navigate('/register', { replace: true }); return; }
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleInput = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const nuevo = [...codigo];
    nuevo[i] = val.slice(-1);
    setCodigo(nuevo);
    setError('');
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !codigo[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCodigo(pasted.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const handleVerificar = async () => {
    const codigoStr = codigo.join('');
    if (codigoStr.length < 6) { setError('Ingresa los 6 digitos del codigo'); return; }

    try {
      setLoading(true);
      setError('');

      // Llama al endpoint POST /api/auth/verificar-cuenta
      const { data } = await axios.post(`${API}/verificar-cuenta`, {
        email,
        codigo: codigoStr
      });

      // Entidad pendiente de aprobacion admin
      if (data.pendienteAprobacion) {
        navigate('/login', {
          state: { mensaje: 'Correo verificado. Tu cuenta sera revisada por un administrador antes de activarse.' }
        });
        return;
      }

      // Auto-login con el JWT devuelto
      if (data.token && data.user) {
        login(data.token, data.user);
        navigate(data.user.rol === 'administrador' ? '/admin' : '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Codigo invalido. Intentalo de nuevo.');
      setCodigo(['', '', '', '', '', '']);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (countdown > 0) return;
    try {
      setReenviando(true);
      setError('');
      await axios.post(`${API}/reenviar-otp`, { email });
      setReenviadoOk(true);
      setCountdown(60);
      setTimeout(() => setReenviadoOk(false), 4000);
    } catch {
      setError('Error al reenviar. Intenta de nuevo.');
    } finally {
      setReenviando(false);
    }
  };

  const codigoCompleto = codigo.join('').length === 6;

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Icono */}
        <div style={s.iconWrap}>
          <ShieldCheck size={28} color="#2563eb" />
        </div>

        <h1 style={s.titulo}>Verifica tu correo</h1>
        <p style={s.subtitulo}>
          Enviamos un codigo de 6 digitos a{' '}
          <strong style={{ color: '#0f172a' }}>{email}</strong>
        </p>

        {/* Inputs OTP */}
        <div
          style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', margin: '1.75rem 0' }}
          onPaste={handlePaste}
        >
          {codigo.map((d, i) => (
            <input
              key={i}
              ref={el => inputsRef.current[i] = el}
              value={d}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              style={{
                width: '48px', height: '56px', textAlign: 'center',
                fontSize: '1.5rem', fontWeight: '700', color: '#0f172a',
                border: `2px solid ${error ? '#fecaca' : d ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '12px', outline: 'none',
                background: error ? '#fef2f2' : d ? '#eff6ff' : 'white',
                transition: 'all 0.15s'
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.65rem 0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.8rem' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Reenvio OK */}
        {reenviadoOk && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#16a34a', fontSize: '0.8rem', marginBottom: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.65rem' }}>
            <CheckCircle2 size={14} /> Nuevo codigo enviado a tu correo
          </div>
        )}

        {/* Botón verificar */}
        <button
          onClick={handleVerificar}
          disabled={loading || !codigoCompleto}
          style={{
            ...s.btnPrimario,
            opacity: (loading || !codigoCompleto) ? 0.6 : 1,
            cursor: (loading || !codigoCompleto) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Verificando...' : 'Verificar cuenta'}
        </button>

        {/* Reenviar */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 0.5rem' }}>
            ¿No recibiste el codigo?
          </p>
          <button
            onClick={handleReenviar}
            disabled={reenviando || countdown > 0}
            style={{
              background: 'none', border: 'none',
              cursor: countdown > 0 ? 'not-allowed' : 'pointer',
              color: countdown > 0 ? '#94a3b8' : '#2563eb',
              fontSize: '0.8rem', fontWeight: '600',
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            <RotateCcw size={13} />
            {countdown > 0 ? `Reenviar en ${countdown}s` : reenviando ? 'Enviando...' : 'Reenviar codigo'}
          </button>
        </div>

        <Link to="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none', marginTop: '1rem' }}>
          <ArrowLeft size={13} /> Volver al registro
        </Link>
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
  btnPrimario: { width: '100%', padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', transition: 'background 0.15s' },
};
