import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, User, Building2, CheckCircle2,
  AlertCircle, Lock, Mail, Phone, MapPin, Link2, FileText, PawPrint
} from 'lucide-react';
import { register } from '../services/auth.service';

function strengthInfo(pw) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [null,
    { label: 'Debil',     color: '#ef4444', w: '20%' },
    { label: 'Regular',   color: '#f97316', w: '40%' },
    { label: 'Buena',     color: '#eab308', w: '60%' },
    { label: 'Fuerte',    color: '#22c55e', w: '80%' },
    { label: 'Excelente', color: '#10b981', w: '100%' },
  ];
  return levels[Math.min(s, 5)];
}

const TIPOS_ENTIDAD = ['Fundación', 'Clínica Privada', 'Entidad Gubernamental'];
const API_BASE = 'http://localhost:3000/api/auth';

export default function Register() {
  const [form, setForm] = useState({
    nombre: '', email: '', contrasena: '', confirmar: '', rol: 'ciudadano',
    nit: '', nombre_organizacion: '', tipo_entidad: '',
    telefono_oficial: '', direccion_sede: '', enlace_verificacion: ''
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const navigate = useNavigate();

  const strength  = strengthInfo(form.contrasena);
  const esEntidad = form.rol === 'entidad';

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.email.trim())  e.email  = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato invalido';
    if (!form.contrasena)    e.contrasena = 'La contrasena es obligatoria';
    else if (form.contrasena.length < 8) e.contrasena = 'Minimo 8 caracteres';
    if (form.contrasena !== form.confirmar) e.confirmar = 'Las contrasenas no coinciden';
    if (esEntidad) {
      if (!form.nit.trim())               e.nit               = 'El NIT es obligatorio';
      if (!form.nombre_organizacion.trim()) e.nombre_organizacion = 'El nombre es obligatorio';
      if (!form.tipo_entidad)             e.tipo_entidad      = 'Selecciona el tipo';
      if (!form.telefono_oficial.trim())  e.telefono_oficial  = 'El telefono es obligatorio';
    }
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setLoading(true);
      const data = await register(
        form.nombre, form.email, form.contrasena, form.rol,
        form.nit, form.nombre_organizacion,
        form.tipo_entidad, form.telefono_oficial,
        form.direccion_sede, form.enlace_verificacion
      );
      // Siempre redirige a verificar OTP
      navigate('/verificar-codigo', { state: { email: form.email, pendiente: data.pendiente } });
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Error al registrarse. Intenta de nuevo.' });
    } finally { setLoading(false); }
  };

  const handleGoogle = () => { window.location.href = `${API_BASE}/google`; };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#2563eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PawPrint size={20} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Crear cuenta</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Plataforma ARIA — Rescate Animal</p>
          </div>
        </div>

        {/* Botón Google */}
        <button onClick={handleGoogle} style={s.btnGoogle}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Registrarse con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>o con correo</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {errors.general && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={15} /><span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selector de rol */}
          <div>
            <label style={s.label}>Tipo de cuenta</label>
            <div style={s.rolGrid}>
              {[
                { value: 'ciudadano', label: 'Ciudadano',  desc: 'Reporta animales en calle', Icon: User },
                { value: 'entidad',   label: 'Entidad',    desc: 'Fundacion o veterinaria',   Icon: Building2 },
              ].map(r => (
                <button key={r.value} type="button"
                  style={{ ...s.rolBtn, ...(form.rol === r.value ? s.rolBtnActive : {}) }}
                  onClick={() => setForm(f => ({ ...f, rol: r.value }))}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: form.rol === r.value ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.4rem' }}>
                    <r.Icon size={16} color={form.rol === r.value ? '#2563eb' : '#94a3b8'} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.label}</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3 }}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campos de entidad */}
          {esEntidad && (
            <div style={s.entidadBox}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', color: '#92400e', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>Las cuentas de entidad requieren verificacion de correo y aprobacion del administrador.</span>
              </div>
              <Field label="Tipo de entidad *" error={errors.tipo_entidad}>
                <select name="tipo_entidad" value={form.tipo_entidad} onChange={handleChange}
                  style={{ ...s.input, ...(errors.tipo_entidad ? s.inputErr : {}) }}>
                  <option value="">Selecciona el tipo</option>
                  {TIPOS_ENTIDAD.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Nombre de la organizacion *" error={errors.nombre_organizacion}>
                <InputIcon Icon={Building2} error={errors.nombre_organizacion}>
                  <input name="nombre_organizacion" value={form.nombre_organizacion} onChange={handleChange}
                    placeholder="Ej: Fundacion Patitas Felices"
                    style={{ ...s.input, ...s.inputWithIcon, ...(errors.nombre_organizacion ? s.inputErr : {}) }} />
                </InputIcon>
              </Field>
              <Field label="NIT / Documento *" error={errors.nit}>
                <InputIcon Icon={FileText} error={errors.nit}>
                  <input name="nit" value={form.nit} onChange={handleChange}
                    placeholder="Ej: 900123456-7"
                    style={{ ...s.input, ...s.inputWithIcon, ...(errors.nit ? s.inputErr : {}) }} />
                </InputIcon>
              </Field>
              <Field label="Telefono oficial *" error={errors.telefono_oficial}>
                <InputIcon Icon={Phone} error={errors.telefono_oficial}>
                  <input name="telefono_oficial" value={form.telefono_oficial} onChange={handleChange}
                    placeholder="Ej: 3001234567"
                    style={{ ...s.input, ...s.inputWithIcon, ...(errors.telefono_oficial ? s.inputErr : {}) }} />
                </InputIcon>
              </Field>
              <Field label="Direccion de la sede (opcional)">
                <InputIcon Icon={MapPin}>
                  <input name="direccion_sede" value={form.direccion_sede} onChange={handleChange}
                    placeholder="Calle 10 # 5-20"
                    style={{ ...s.input, ...s.inputWithIcon }} />
                </InputIcon>
              </Field>
              <Field label="Sitio web o red social (opcional)">
                <InputIcon Icon={Link2}>
                  <input name="enlace_verificacion" value={form.enlace_verificacion} onChange={handleChange}
                    placeholder="https://..."
                    style={{ ...s.input, ...s.inputWithIcon }} />
                </InputIcon>
              </Field>
            </div>
          )}

          <Field label="Nombre completo *" error={errors.nombre}>
            <InputIcon Icon={User} error={errors.nombre}>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre completo"
                style={{ ...s.input, ...s.inputWithIcon, ...(errors.nombre ? s.inputErr : {}) }} />
            </InputIcon>
          </Field>

          <Field label="Correo electronico *" error={errors.email}>
            <InputIcon Icon={Mail} error={errors.email}>
              <input name="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" type="email"
                style={{ ...s.input, ...s.inputWithIcon, ...(errors.email ? s.inputErr : {}) }} />
            </InputIcon>
          </Field>

          <Field label="Contrasena *" error={errors.contrasena}>
            <div style={{ position: 'relative' }}>
              <InputIcon Icon={Lock} error={errors.contrasena}>
                <input name="contrasena" value={form.contrasena} onChange={handleChange}
                  type={showPw ? 'text' : 'password'} placeholder="Minimo 8 caracteres"
                  style={{ ...s.input, ...s.inputWithIcon, paddingRight: '2.5rem', ...(errors.contrasena ? s.inputErr : {}) }} />
              </InputIcon>
              <button type="button" onClick={() => setShowPw(v => !v)} style={s.eyeBtn}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {strength && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: strength.w, background: strength.color, borderRadius: '99px', transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '600', color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </Field>

          <Field label="Confirmar contrasena *" error={errors.confirmar}>
            <div style={{ position: 'relative' }}>
              <InputIcon Icon={Lock} error={errors.confirmar}>
                <input name="confirmar" value={form.confirmar} onChange={handleChange}
                  type={showPw2 ? 'text' : 'password'} placeholder="Repite tu contrasena"
                  style={{ ...s.input, ...s.inputWithIcon, paddingRight: '2.5rem', ...(errors.confirmar ? s.inputErr : {}) }} />
              </InputIcon>
              <button type="button" onClick={() => setShowPw2(v => !v)} style={s.eyeBtn}>
                {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {form.confirmar && form.contrasena === form.confirmar && (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={12} /> Las contrasenas coinciden
              </span>
            )}
          </Field>

          <button type="submit" disabled={loading} style={{ ...s.btnPrimario, opacity: loading ? 0.7 : 1, marginTop: '0.25rem' }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
          Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Inicia sesion</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {label && <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{label}</label>}
      {children}
      {error && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</span>}
    </div>
  );
}

function InputIcon({ Icon, error, children }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Icon size={15} style={{ position: 'absolute', left: '0.75rem', color: error ? '#ef4444' : '#94a3b8', pointerEvents: 'none' }} />
      {children}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  card: { background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  btnGoogle: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', width: '100%', padding: '0.7rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', fontSize: '0.875rem', color: '#374151', cursor: 'pointer' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151' },
  input: { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: 'white' },
  inputWithIcon: { paddingLeft: '2.25rem' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  eyeBtn: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  rolGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' },
  rolBtn: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0.875rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', color: '#374151' },
  rolBtnActive: { borderColor: '#2563eb', background: '#eff6ff' },
  entidadBox: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  btnPrimario: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
};
