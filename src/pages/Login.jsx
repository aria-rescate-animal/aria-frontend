import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, PawPrint, AlertCircle, CheckCircle2 } from 'lucide-react';
import { login as loginApi } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

const BACKEND = 'http://localhost:3000/api/auth';

export default function Login() {
  const [form, setForm]       = useState({ email: '', contrasena: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [params]  = useSearchParams();
  const { login, isAuthenticated, esAdministrador } = useAuth();

  const mensajeBienvenida = location.state?.mensaje || '';
  const errorGoogle       = params.get('error') === 'google';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(esAdministrador ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validar = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'El correo es obligatorio';
    if (!form.contrasena)   e.contrasena = 'La contraseña es obligatoria';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setLoading(true);
      const data = await loginApi(form.email, form.contrasena);
      login(data.token, data.user);
      navigate(data.user?.rol === 'administrador' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error || '';
      if (err.response?.data?.requiereVerificacion) {
        navigate('/verificar-codigo', { state: { email: form.email } });
        return;
      }
      if (status === 401 || status === 404) setErrors({ general: 'Correo o contraseña incorrectos' });
      else if (status === 403) setErrors({ general: msg });
      else if (err.code === 'ERR_NETWORK') setErrors({ general: 'No se pudo conectar con el servidor' });
      else setErrors({ general: 'Error al iniciar sesión' });
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    window.location.href = `${BACKEND}/google`;
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: '#2563eb', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PawPrint size={17} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>ARIA</h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>Plataforma de Rescate Animal</p>
          </div>
        </div>

        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Iniciar sesión</h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>Ingresa con tu cuenta para continuar</p>

        {/* Alertas */}
        {mensajeBienvenida && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#16a34a' }}>
            <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {mensajeBienvenida}
          </div>
        )}
        {errorGoogle && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#dc2626' }}>
            <AlertCircle size={14} /> Error al iniciar sesión con Google. Intenta de nuevo.
          </div>
        )}
        {errors.general && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#dc2626' }}>
            <AlertCircle size={14} /> {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div>
            <label style={s.label}>Correo electrónico</label>
            <div style={{ position: 'relative', marginTop: '0.3rem' }}>
              <Mail size={15} style={s.inputIcon} />
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="tucorreo@ejemplo.com"
                style={{ ...s.input, paddingLeft: '2.25rem', ...(errors.email ? s.inputErr : {}) }} />
            </div>
            {errors.email && <p style={s.errMsg}>{errors.email}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={s.label}>Contraseña</label>
              <Link to="/recuperar" style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={s.inputIcon} />
              <input name="contrasena" type={showPw ? 'text' : 'password'} value={form.contrasena} onChange={handleChange}
                placeholder="Tu contraseña"
                style={{ ...s.input, paddingLeft: '2.25rem', paddingRight: '2.5rem', ...(errors.contrasena ? s.inputErr : {}) }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={s.eyeBtn}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.contrasena && <p style={s.errMsg}>{errors.contrasena}</p>}
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btnPrimario, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>o continúa con</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Botón Google */}
        <button onClick={handleGoogle} style={s.btnGoogle}>
          {/* Ícono SVG de Google */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Iniciar sesión con Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151', display: 'block' },
  input: { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border 0.15s' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  inputIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' },
  eyeBtn: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  errMsg: { color: '#dc2626', fontSize: '0.75rem', margin: '0.25rem 0 0' },
  btnPrimario: { width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', transition: 'background 0.15s' },
  btnGoogle: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.7rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '600', fontSize: '0.875rem', color: '#374151', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' },
};
