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
    const nuevosErrores = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) {
      nuevosErrores.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'El correo no tiene un formato válido';
    }
    if (!form.contrasena) {
      nuevosErrores.contrasena = 'La contraseña es obligatoria';
    } else if (form.contrasena.length < 8) {
      nuevosErrores.contrasena = 'La contraseña debe tener mínimo 8 caracteres';
    }
    if (!form.confirmar) {
      nuevosErrores.confirmar = 'Debes confirmar tu contraseña';
    } else if (form.contrasena !== form.confirmar) {
      nuevosErrores.confirmar = 'Las contraseñas no coinciden';
    }
    return nuevosErrores;
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
      if (err.response?.status === 400) {
        setErrors({ general: err.response.data.message || 'El correo ya está registrado' });
      } else if (err.code === 'ERR_NETWORK') {
        setErrors({ general: 'No se pudo conectar con el servidor. Intenta más tarde.' });
      } else {
        setErrors({ general: 'Error al registrarse. Intenta de nuevo.' });
      }
    } finally { setLoading(false); }
  };

  const inputStyle = (campo) => ({
    ...styles.input,
    border: errors[campo] ? '1.5px solid #C0392B' : '1.5px solid #BBDEFB',
    background: errors[campo] ? '#FFF8F8' : '#F8FBFF'
  });

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        input:focus {
          border-color: #1565C0 !important;
          box-shadow: 0 0 0 3px rgba(21,101,192,0.13);
        }
        button[type="submit"]:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(21,101,192,0.45) !important;
        }
        button[type="submit"] { transition: all 0.2s; }
        .toggle-pw:hover { color: #1565C0 !important; }
      `}</style>

      <div style={styles.leftPanel}>
        <div style={styles.logoArea}>
          <div style={{ ...styles.logoIcon, animation: 'pulse 3s ease-in-out infinite' }}>🐾</div>
          <h1 style={styles.logoTitle}>ARIA</h1>
          <p style={styles.logoSubtitle}>Aplicación para el Rescate<br />Inteligente de Animales</p>
          <div style={styles.tagline}>
            <span style={styles.tagItem}>🏥 Atención veterinaria</span>
            <span style={styles.tagItem}>📍 Geolocalización</span>
            <span style={styles.tagItem}>🤖 IA integrada</span>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statBox}><span style={styles.statNum}>+120</span><span style={styles.statLabel}>Rescates</span></div>
            <div style={styles.statBox}><span style={styles.statNum}>+40</span><span style={styles.statLabel}>Voluntarios</span></div>
            <div style={styles.statBox}><span style={styles.statNum}>+15</span><span style={styles.statLabel}>Veterinarios</span></div>
          </div>
        </div>
        <div style={styles.decorCircle1} /><div style={styles.decorCircle2} /><div style={styles.decorCircle3} />
      </div>

      <div style={styles.rightPanel}>
        <div style={{ ...styles.card, animation: 'fadeSlideIn 0.5s ease both' }}>
          <div style={styles.badge}>✦ Nueva cuenta</div>
          <h2 style={styles.title}>Crear cuenta</h2>
          <p style={styles.subtitle}>Únete y ayuda a rescatar animales en situación de calle</p>

          {errors.general && <div style={styles.errorGeneral}>⚠️ {errors.general}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.group}>
              <label style={styles.label}>Nombre completo</label>
              <input style={inputStyle('nombre')} type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre completo" />
              {errors.nombre && <span style={styles.errorMsg}>⚠ {errors.nombre}</span>}
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Correo electrónico</label>
              <input style={inputStyle('email')} type="text" name="email" value={form.email} onChange={handleChange} placeholder="tucorreo@ejemplo.com" />
              {errors.email && <span style={styles.errorMsg}>⚠ {errors.email}</span>}
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.passwordWrapper}>
                <input
                  style={{ ...inputStyle('contrasena'), paddingRight: '2.8rem' }}
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
                <button type="button" className="toggle-pw" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {form.contrasena && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBarBg}>
                    <div style={{ ...styles.strengthBar, width: `${(strength.level / 5) * 100}%`, background: strength.color }} />
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.contrasena && <span style={styles.errorMsg}>⚠ {errors.contrasena}</span>}
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Confirmar contraseña</label>
              <div style={styles.passwordWrapper}>
                <input
                  style={{ ...inputStyle('confirmar'), paddingRight: '2.8rem' }}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmar"
                  value={form.confirmar}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                />
                <button type="button" className="toggle-pw" style={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirmar && form.contrasena === form.confirmar && (
                <span style={{ color: '#43A047', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>✓ Las contraseñas coinciden</span>
              )}
              {errors.confirmar && <span style={styles.errorMsg}>⚠ {errors.confirmar}</span>}
            </div>

            <button
              style={{ ...styles.button, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Registrando...' : '🐾 Crear mi cuenta'}
            </button>
          </form>

          <p style={styles.link}>¿Ya tienes cuenta?{' '}<Link to="/login" style={styles.linkAnchor}>Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: '#F0F6FF' },
  leftPanel: { flex: '1 1 320px', background: 'linear-gradient(160deg, #0A2463 0%, #1565C0 55%, #0097A7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', position: 'relative', overflow: 'hidden', minHeight: '220px' },
  logoArea: { textAlign: 'center', zIndex: 1, position: 'relative' },
  logoIcon: { fontSize: '4.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))', display: 'block' },
  logoTitle: { color: 'white', fontSize: '3.2rem', fontWeight: '800', margin: '0', letterSpacing: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' },
  logoSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', marginTop: '0.75rem', lineHeight: '1.7' },
  tagline: { marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  tagItem: { color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', background: 'rgba(255,255,255,0.12)', padding: '0.35rem 0.9rem', borderRadius: '20px', display: 'inline-block' },
  statsRow: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center' },
  statBox: { background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.5rem 0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'blur(4px)' },
  statNum: { color: 'white', fontWeight: '800', fontSize: '1.1rem' },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', marginTop: '2px' },
  decorCircle1: { position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-100px', right: '-100px' },
  decorCircle2: { position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,151,167,0.2)', bottom: '-70px', left: '-50px' },
  decorCircle3: { position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', bottom: '80px', right: '30px' },
  rightPanel: { flex: '1 1 320px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: { background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 8px 40px rgba(10,36,99,0.12)', width: '100%', maxWidth: '440px' },
  badge: { display: 'inline-block', background: '#E3F2FD', color: '#1565C0', padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '1rem' },
  title: { color: '#0A2463', fontSize: '1.8rem', fontWeight: '700', margin: '0 0 0.25rem 0' },
  subtitle: { color: '#888', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.5' },
  errorGeneral: { background: '#FFF0F0', color: '#C0392B', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #FADADD' },
  errorMsg: { color: '#C0392B', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' },
  group: { marginBottom: '1.1rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#0A2463', fontSize: '0.88rem', fontWeight: '600' },
  input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', color: '#333', transition: 'border 0.2s, box-shadow 0.2s' },
  passwordWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#aaa', padding: '0', lineHeight: '1', transition: 'color 0.2s' },
  strengthContainer: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' },
  strengthBarBg: { flex: 1, height: '5px', background: '#E0E0E0', borderRadius: '10px', overflow: 'hidden' },
  strengthBar: { height: '100%', borderRadius: '10px', transition: 'width 0.3s, background 0.3s' },
  strengthLabel: { fontSize: '0.75rem', fontWeight: '600', minWidth: '60px' },
  button: { width: '100%', padding: '0.9rem', background: 'linear-gradient(90deg, #1565C0, #0097A7)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', marginTop: '0.75rem', boxShadow: '0 4px 15px rgba(21,101,192,0.35)', letterSpacing: '0.5px' },
  link: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: '#888' },
  linkAnchor: { color: '#1565C0', fontWeight: '600', textDecoration: 'none' }
};
