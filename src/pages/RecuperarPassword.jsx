import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:3000/api/auth';

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [paso, setPaso]           = useState(1); // 1=email, 2=otp, 3=nueva contraseña
  const [email, setEmail]         = useState('');
  const [codigo, setCodigo]       = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({ nueva: '', confirmar: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showPw2, setShowPw2]     = useState(false);
  const inputsRef = useRef([]);

  // ── PASO 1: enviar email ──────────────────────────────────────────────────
  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Ingresa tu correo'); return; }
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API}/recuperar-password`, { email });
      setPaso(2);
    } catch { setError('Error al enviar. Intenta de nuevo.'); }
    finally { setLoading(false); }
  };

  // ── PASO 2: validar OTP ───────────────────────────────────────────────────
  const handleInputOTP = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const nuevo = [...codigo];
    nuevo[i] = val.slice(-1);
    setCodigo(nuevo);
    setError('');
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDownOTP = (i, e) => {
    if (e.key === 'Backspace' && !codigo[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handleValidarOTP = async () => {
    const codigoStr = codigo.join('');
    if (codigoStr.length < 6) { setError('Ingresa el codigo completo'); return; }
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.post(`${API}/validar-otp-recuperacion`, { email, codigo: codigoStr });
      setResetToken(data.resetToken);
      setPaso(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Codigo invalido. Intentalo de nuevo.');
      setCodigo(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally { setLoading(false); }
  };

  // ── PASO 3: nueva contraseña ──────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.nueva.length < 8) { setError('Minimo 8 caracteres'); return; }
    if (passwords.nueva !== passwords.confirmar) { setError('Las contrasenas no coinciden'); return; }
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API}/reset-password`, { resetToken, contrasena: passwords.nueva });
      setPaso(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar. Intenta de nuevo.');
    } finally { setLoading(false); }
  };

  // ── Indicador de pasos ────────────────────────────────────────────────────
  const Stepper = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', justifyContent: 'center' }}>
      {[1, 2, 3].map((p, i) => (
        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: '700',
            background: paso > p ? '#2563eb' : paso === p ? '#2563eb' : '#e2e8f0',
            color: paso >= p ? 'white' : '#94a3b8'
          }}>
            {paso > p ? <CheckCircle2 size={14} /> : p}
          </div>
          {i < 2 && <div style={{ width: '32px', height: '2px', background: paso > p ? '#2563eb' : '#e2e8f0' }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Éxito */}
        {paso === 4 ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: '#f0fdf4', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={28} color="#16a34a" />
            </div>
            <h1 style={s.titulo}>Contrasena actualizada</h1>
            <p style={s.subtitulo}>Tu contrasena fue cambiada correctamente. Ya puedes iniciar sesion.</p>
            <button onClick={() => navigate('/login')} style={{ ...s.btnPrimario, border: 'none', marginTop: '1.5rem', cursor: 'pointer' }}>
              Iniciar sesion
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ ...s.titulo, marginBottom: '0.25rem' }}>Recuperar contrasena</h1>
            <p style={{ ...s.subtitulo, marginBottom: '1.25rem' }}>
              {paso === 1 && 'Ingresa tu correo registrado.'}
              {paso === 2 && `Ingresa el codigo enviado a ${email}`}
              {paso === 3 && 'Crea tu nueva contrasena.'}
            </p>
            <Stepper />

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.8rem' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* ── PASO 1: Email ── */}
            {paso === 1 && (
              <form onSubmit={handleEnviarEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={s.label}>Correo electronico</label>
                  <div style={{ position: 'relative', marginTop: '0.3rem' }}>
                    <Mail size={15} style={s.inputIcon} />
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="tucorreo@ejemplo.com"
                      style={{ ...s.input, paddingLeft: '2.25rem' }}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ ...s.btnPrimario, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Enviando...' : 'Enviar codigo'}
                </button>
              </form>
            )}

            {/* ── PASO 2: OTP ── */}
            {paso === 2 && (
              <div>
                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', margin: '0 0 1.5rem' }}>
                  {codigo.map((d, i) => (
                    <input key={i} ref={el => inputsRef.current[i] = el}
                      value={d} maxLength={1}
                      onChange={e => handleInputOTP(i, e.target.value)}
                      onKeyDown={e => handleKeyDownOTP(i, e)}
                      style={{
                        width: '44px', height: '52px', textAlign: 'center',
                        fontSize: '1.4rem', fontWeight: '700', color: '#0f172a',
                        border: `2px solid ${d ? '#2563eb' : '#e2e8f0'}`,
                        borderRadius: '10px', outline: 'none',
                        background: d ? '#eff6ff' : 'white'
                      }}
                    />
                  ))}
                </div>
                <button onClick={handleValidarOTP} disabled={loading || codigo.join('').length < 6}
                  style={{ ...s.btnPrimario, border: 'none', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || codigo.join('').length < 6) ? 0.6 : 1 }}>
                  {loading ? 'Verificando...' : 'Verificar codigo'}
                </button>
                <button onClick={() => { setPaso(1); setCodigo(['','','','','','']); setError(''); }}
                  style={{ display: 'block', margin: '0.75rem auto 0', background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}>
                  Cambiar correo
                </button>
              </div>
            )}

            {/* ── PASO 3: Nueva contraseña ── */}
            {paso === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={s.label}>Nueva contrasena</label>
                  <div style={{ position: 'relative', marginTop: '0.3rem' }}>
                    <Lock size={15} style={s.inputIcon} />
                    <input type={showPw ? 'text' : 'password'}
                      value={passwords.nueva}
                      onChange={e => { setPasswords(p => ({ ...p, nueva: e.target.value })); setError(''); }}
                      placeholder="Minimo 8 caracteres"
                      style={{ ...s.input, paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={s.eyeBtn}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={s.label}>Confirmar contrasena</label>
                  <div style={{ position: 'relative', marginTop: '0.3rem' }}>
                    <Lock size={15} style={s.inputIcon} />
                    <input type={showPw2 ? 'text' : 'password'}
                      value={passwords.confirmar}
                      onChange={e => { setPasswords(p => ({ ...p, confirmar: e.target.value })); setError(''); }}
                      placeholder="Repite tu contrasena"
                      style={{ ...s.input, paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    />
                    <button type="button" onClick={() => setShowPw2(v => !v)} style={s.eyeBtn}>
                      {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {passwords.confirmar && passwords.nueva === passwords.confirmar && (
                    <p style={{ color: '#16a34a', fontSize: '0.75rem', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={12} /> Las contrasenas coinciden
                    </p>
                  )}
                </div>
                <button type="submit" disabled={loading}
                  style={{ ...s.btnPrimario, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Actualizando...' : 'Cambiar contrasena'}
                </button>
              </form>
            )}

            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none', marginTop: '1.25rem' }}>
              <ArrowLeft size={13} /> Volver al inicio de sesion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  titulo: { margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', textAlign: 'center' },
  subtitulo: { margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, textAlign: 'center' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151', display: 'block' },
  input: { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' },
  inputIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' },
  eyeBtn: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  btnPrimario: { width: '100%', padding: '0.8rem', background: '#2563eb', color: 'white', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', display: 'block', textAlign: 'center', textDecoration: 'none' },
};
