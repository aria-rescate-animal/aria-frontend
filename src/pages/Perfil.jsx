import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerUsuario, eliminarToken, guardarToken } from '../utils/auth.utils';

export default function Perfil() {
  const navigate = useNavigate();
  const user = obtenerUsuario();
  const [form, setForm] = useState({ nombre: user?.nombre || '', email: user?.email || '' });
  const [editando, setEditando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuardar = () => {
    const updatedUser = { ...user, ...form };
    guardarToken(localStorage.getItem('token'), updatedUser);
    setEditando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleLogout = () => {
    eliminarToken();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input:focus { border-color: #1565C0 !important; box-shadow: 0 0 0 3px rgba(21,101,192,0.13); }
      `}</style>

      {/* Back */}
      <div style={styles.topBar}>
        <Link to="/dashboard" style={styles.backBtn}>← Volver al dashboard</Link>
      </div>

      <div style={{ ...styles.card, animation: 'fadeIn 0.4s ease both' }}>
        {/* Avatar */}
        <div style={styles.avatarArea}>
          <div style={styles.avatar}>{(user?.nombre || 'U')[0].toUpperCase()}</div>
          <h2 style={styles.avatarName}>{user?.nombre || 'Usuario'}</h2>
          <span style={styles.rolBadge}>{user?.rol || 'rescatista'}</span>
        </div>

        {guardado && (
          <div style={styles.successMsg}>✅ Perfil actualizado correctamente</div>
        )}

        {/* Formulario */}
        <div style={styles.formSection}>
          <div style={styles.group}>
            <label style={styles.label}>Nombre completo</label>
            <input
              style={{ ...styles.input, background: editando ? '#F8FBFF' : '#F5F5F5' }}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              disabled={!editando}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              style={{ ...styles.input, background: editando ? '#F8FBFF' : '#F5F5F5' }}
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!editando}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Rol</label>
            <input style={{ ...styles.input, background: '#F5F5F5' }} value={user?.rol || 'rescatista'} disabled />
          </div>
        </div>

        {/* Botones */}
        <div style={styles.actions}>
          {!editando ? (
            <button style={styles.btnPrimary} onClick={() => setEditando(true)}>✏️ Editar perfil</button>
          ) : (
            <>
              <button style={styles.btnPrimary} onClick={handleGuardar}>💾 Guardar cambios</button>
              <button style={styles.btnSecondary} onClick={() => setEditando(false)}>Cancelar</button>
            </>
          )}
          <button style={styles.btnLogout} onClick={handleLogout}>🚪 Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#F0F6FF', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  topBar: { marginBottom: '1.5rem' },
  backBtn: { color: '#1565C0', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' },
  card: { background: 'white', borderRadius: '20px', boxShadow: '0 8px 40px rgba(10,36,99,0.1)', padding: '2.5rem', maxWidth: '480px', margin: '0 auto' },
  avatarArea: { textAlign: 'center', marginBottom: '2rem' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #0097A7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '2rem', margin: '0 auto 0.75rem', boxShadow: '0 4px 16px rgba(21,101,192,0.3)' },
  avatarName: { color: '#0A2463', fontSize: '1.3rem', fontWeight: '700', margin: '0 0 0.4rem' },
  rolBadge: { display: 'inline-block', background: '#E3F2FD', color: '#1565C0', padding: '0.25rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  successMsg: { background: '#E8F5E9', color: '#2E7D32', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.9rem', border: '1px solid #C8E6C9', textAlign: 'center' },
  formSection: { marginBottom: '1.5rem' },
  group: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#0A2463', fontSize: '0.88rem', fontWeight: '600' },
  input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1.5px solid #BBDEFB', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', color: '#333', transition: 'border 0.2s, box-shadow 0.2s' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  btnPrimary: { padding: '0.85rem', background: 'linear-gradient(90deg, #1565C0, #0097A7)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' },
  btnSecondary: { padding: '0.85rem', background: '#F0F6FF', color: '#1565C0', border: '1.5px solid #BBDEFB', borderRadius: '10px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
  btnLogout: { padding: '0.85rem', background: '#FFF0F0', color: '#C0392B', border: '1.5px solid #FADADD', borderRadius: '10px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
};
