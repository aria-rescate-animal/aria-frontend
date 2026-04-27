import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth.service';
import { guardarToken, haySesionActiva, redirigirSegunRol } from '../utils/auth.utils';

export default function Login() {
  const [form, setForm] = useState({ email: '', contrasena: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (haySesionActiva()) navigate('/dashboard');
  }, [navigate]);

  const validar = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'El correo no tiene un formato válido';
    if (!form.contrasena) e.contrasena = 'La contraseña es obligatoria';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroresEncontrados = validar();
    if (Object.keys(erroresEncontrados).length > 0) { setErrors(erroresEncontrados); return; }
    try {
      setLoading(true);
      const data = await login(form.email, form.contrasena);
      guardarToken(data.token, data.user);
      redirigirSegunRol(navigate, data.user?.rol);
    } catch (err) {
      if (err.response?.status === 401) setErrors({ general: 'Correo o contraseña incorrectos' });
      else if (err.code === 'ERR_NETWORK') setErrors({ general: 'No se pudo conectar con el servidor.' });
      else setErrors({ general: 'Error al iniciar sesión. Intenta de nuevo.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="aria-left-panel">
        <div className="auth-logo-area">
          <span className="auth-logo-icon">🐾</span>
          <h1 className="auth-logo-title">ARIA</h1>
          <p className="auth-logo-subtitle">Aplicación para el Rescate<br />Inteligente de Animales</p>
          <div className="auth-tags">
            <span className="auth-tag">🏥 Atención veterinaria</span>
            <span className="auth-tag">📍 Geolocalización</span>
            <span className="auth-tag">🤖 IA integrada</span>
          </div>
          <div className="auth-stats">
            <div className="auth-stat"><span className="auth-stat-num">+120</span><span className="auth-stat-label">Rescates</span></div>
            <div className="auth-stat"><span className="auth-stat-num">+40</span><span className="auth-stat-label">Voluntarios</span></div>
            <div className="auth-stat"><span className="auth-stat-num">+15</span><span className="auth-stat-label">Veterinarios</span></div>
          </div>
        </div>
        <div className="auth-circle auth-circle-1" />
        <div className="auth-circle auth-circle-2" />
        <div className="auth-circle auth-circle-3" />
      </div>

      <div className="auth-right-panel">
        <div className="aria-card auth-card">
          <span className="aria-badge">✦ Bienvenido de vuelta</span>
          <h2 className="auth-title">Iniciar sesión</h2>
          <p className="auth-subtitle">Ingresa con tu cuenta para continuar</p>

          {errors.general && <div className="aria-alert-error">⚠️ {errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-group">
              <label className="aria-label">Correo electrónico</label>
              <input
                className={`aria-input${errors.email ? ' error' : ''}`}
                type="text" name="email" value={form.email}
                onChange={handleChange} placeholder="tucorreo@ejemplo.com"
              />
              {errors.email && <span className="aria-error-msg">⚠ {errors.email}</span>}
            </div>

            <div className="auth-group">
              <label className="aria-label">Contraseña</label>
              <div className="auth-pw-wrapper">
                <input
                  className={`aria-input${errors.contrasena ? ' error' : ''}`}
                  style={{ paddingRight: '2.8rem' }}
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena" value={form.contrasena}
                  onChange={handleChange} placeholder="Tu contraseña"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.contrasena && <span className="aria-error-msg">⚠ {errors.contrasena}</span>}
            </div>

            <div className="auth-forgot">
              <Link to="/recuperar" className="aria-link">¿Olvidaste tu contraseña?</Link>
            </div>

            <button className="aria-btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Ingresando...' : '🐾 Iniciar sesión'}
            </button>
          </form>

          <p className="auth-footer-link">¿No tienes cuenta?{' '}<Link to="/register" className="aria-link">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
}
