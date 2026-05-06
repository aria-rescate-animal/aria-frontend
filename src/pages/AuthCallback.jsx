import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://localhost:3000/api/auth';

// Maneja tanto /auth/callback (Google OAuth) como /auth/verificar/:token (Magic Link)
export default function AuthCallback() {
  const [params]    = useSearchParams();
  const { token: magicToken } = useParams();
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (magicToken) {
      // Magic Link — el backend redirige aquí con JWT en query params
      // Este componente no hace nada, el backend redirige directamente a /auth/callback
      return;
    }

    // Google OAuth callback — llega con ?token=xxx&user=xxx
    const token   = params.get('token');
    const userStr = params.get('user');
    const errorParam = params.get('error');
    const mensaje = params.get('mensaje');

    if (errorParam === 'link_invalido') {
      navigate('/login?error=link_invalido', { replace: true });
      return;
    }

    if (errorParam === 'link_expirado') {
      navigate('/login?error=link_expirado', { replace: true });
      return;
    }

    if (mensaje === 'verificado_pendiente') {
      navigate('/login', {
        replace: true,
        state: { mensaje: 'Correo verificado. Tu cuenta sera revisada por un administrador.' }
      });
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(token, user);
        navigate(user.rol === 'administrador' ? '/admin' : '/dashboard', { replace: true });
      } catch {
        navigate('/login?error=google', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  if (error) return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={{ textAlign: 'center' }}>
        <div style={s.spinner} />
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '1rem' }}>
          Verificando tu cuenta...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' },
  card: { background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', textAlign: 'center' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
};
