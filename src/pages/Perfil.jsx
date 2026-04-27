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
    guardarToken(localStorage.getItem('token'), { ...user, ...form });
    setEditando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  const handleLogout = () => { eliminarToken(); navigate('/login'); };

  return (
    <div className="perfil-page">
      <div className="perfil-topbar">
        <Link to="/dashboard" className="aria-link">← Volver al dashboard</Link>
      </div>

      <div className="aria-card perfil-card">
        <div className="perfil-avatar-area">
          <div className="perfil-avatar">{(user?.nombre || 'U')[0].toUpperCase()}</div>
          <h2 className="perfil-nombre">{user?.nombre || 'Usuario'}</h2>
          <span className="aria-badge">{user?.rol || 'rescatista'}</span>
        </div>

        {guardado && <div className="aria-alert-success">✅ Perfil actualizado correctamente</div>}

        <div className="perfil-form">
          <div className="auth-group">
            <label className="aria-label">Nombre completo</label>
            <input
              className="aria-input"
              style={{ background: editando ? 'var(--aria-bg-input)' : '#F5F5F5' }}
              name="nombre" value={form.nombre}
              onChange={handleChange} disabled={!editando}
            />
          </div>
          <div className="auth-group">
            <label className="aria-label">Correo electrónico</label>
            <input
              className="aria-input"
              style={{ background: editando ? 'var(--aria-bg-input)' : '#F5F5F5' }}
              name="email" value={form.email}
              onChange={handleChange} disabled={!editando}
            />
          </div>
          <div className="auth-group">
            <label className="aria-label">Rol</label>
            <input className="aria-input" style={{ background: '#F5F5F5' }} value={user?.rol || 'rescatista'} disabled />
          </div>
        </div>

        <div className="perfil-actions">
          {!editando ? (
            <button className="aria-btn-primary" onClick={() => setEditando(true)}>✏️ Editar perfil</button>
          ) : (
            <>
              <button className="aria-btn-primary" onClick={handleGuardar}>💾 Guardar cambios</button>
              <button className="aria-btn-secondary" onClick={() => setEditando(false)}>Cancelar</button>
            </>
          )}
          <button className="perfil-btn-logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
