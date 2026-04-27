import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth.service';

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: 'Débil', color: '#E53935' };
  if (score <= 2) return { level: 2, label: 'Regular', color: '#FB8C00' };
  if (score <= 3) return { level: 3, label: 'Buena', color: '#FDD835' };
  if (score <= 4) return { level: 4, label: 'Fuerte', color: '#43A047' };
  return { level: 5, label: 'Muy fuerte', color: '#00897B' };
}

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', contrasena: '', confirmar: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(form.contrasena);

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) e.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'El correo no tiene un formato válido';
    if (!form.contrasena) e.contrasena = 'La contraseña es obligatoria';
    else if (form.contrasena.length < 8) e.contrasena = 'La contraseña debe tener mínimo 8 caracteres';
    if (!form.confirmar) e.confirmar = 'Debes confirmar tu contraseña';
    else if (form.contrasena !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden';
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
      await register(form.nombre, form.email, form.contrasena);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 400) setErrors({ general: err.response.data.message || 'El correo ya está registrado' });
      else if (err.code === 'ERR_NETWORK') setErrors({ general: 'No se pudo conectar con el servidor.' });
      else setErrors({ general: 'Error al registrarse. Intenta de nuevo.' });
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
          <span className="aria-badge">✦ Nueva cuenta</span>
          <h2 className="auth-title">Crear cuenta</h2>
          <p className="auth-subtitle">Únete y ayuda a rescatar animales en situación de calle</p>

          {errors.general && <div className="aria-alert-error">⚠️ {errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-group">
              <label className="aria-label">Nombre completo</label>
              <input className={`aria-input${errors.nombre ? ' error' : ''}`} type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre completo" />
              {errors.nombre && <span className="aria-error-msg">⚠ {errors.nombre}</span>}
            </div>

            <div className="auth-group">
              <label className="aria-label">Correo electrónico</label>
              <input className={`aria-input${errors.email ? ' error' : ''}`} type="text" name="email" value={form.email} onChange={handleChange} placeholder="tucorreo@ejemplo.com" />
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
                  onChange={handleChange} placeholder="Mínimo 8 caracteres"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {form.contrasena && (
                <div className="auth-strength">
                  <div className="auth-strength-bar-bg">
                    <div className="auth-strength-bar" style={{ width: `${(strength.level / 5) * 100}%`, background: strength.color }} />
                  </div>
                  <span className="auth-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.contrasena && <span className="aria-error-msg">⚠ {errors.contrasena}</span>}
            </div>

            <div className="auth-group">
              <label className="aria-label">Confirmar contraseña</label>
              <div className="auth-pw-wrapper">
                <input
                  className={`aria-input${errors.confirmar ? ' error' : ''}`}
                  style={{ paddingRight: '2.8rem' }}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmar" value={form.confirmar}
                  onChange={handleChange} placeholder="Repite tu contraseña"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirmar && form.contrasena === form.confirmar && (
                <span className="auth-match">✓ Las contraseñas coinciden</span>
              )}
              {errors.confirmar && <span className="aria-error-msg">⚠ {errors.confirmar}</span>}
            </div>

            <button className="aria-btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Registrando...' : '🐾 Crear mi cuenta'}
            </button>
          </form>

          <p className="auth-footer-link">¿Ya tienes cuenta?{' '}<Link to="/login" className="aria-link">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
}
