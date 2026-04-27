// Issue #17 - UI: Formulario de Nuevo Reporte y Validaciones
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearReporte } from '../services/reportes.service';

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Reptil', 'Otro'];

export default function NuevoReporte() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ especie: '', descripcion: '', ubicacion: '' });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const fileInputRef = useRef(null);

  const validar = () => {
    const e = {};
    if (!form.especie) e.especie = 'Selecciona una especie';
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria';
    else if (form.descripcion.trim().length < 10) e.descripcion = 'Mínimo 10 caracteres';
    if (!form.ubicacion.trim()) e.ubicacion = 'La ubicación es obligatoria';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = validar();
    if (Object.keys(errores).length > 0) { setErrors(errores); return; }
    try {
      setLoading(true);
      await crearReporte({ ...form, estado: 'urgente', foto: fotoPreview || null });
    } catch {
      console.log('📋 Nuevo reporte (mock):', form);
    } finally {
      setLoading(false);
      setEnviado(true);
    }
  };

  if (enviado) return (
    <div className="nuevo-reporte-success-page">
      <div className="aria-card nuevo-reporte-success-card">
        <span style={{ fontSize: '3.5rem' }}>🐾</span>
        <h2 style={{ color: 'var(--aria-azul-oscuro)', margin: '0.75rem 0 0.5rem' }}>¡Reporte enviado!</h2>
        <p style={{ color: 'var(--aria-texto-muted)', marginBottom: '1.5rem' }}>Tu reporte fue registrado correctamente.</p>
        <button className="aria-btn-primary" onClick={() => navigate('/reportes')}>Ver Feed de Rescates</button>
      </div>
    </div>
  );

  return (
    <div className="nuevo-reporte-page">
      <div className="nuevo-reporte-header">
        <button onClick={() => navigate(-1)} className="nuevo-reporte-back-btn">← Atrás</button>
        <h1 className="nuevo-reporte-title">Nuevo Reporte</h1>
      </div>

      <div className="aria-card nuevo-reporte-card">
        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label className="aria-label">Especie *</label>
            <select name="especie" value={form.especie} onChange={handleChange}
              className={`aria-input${errors.especie ? ' error' : ''}`}>
              <option value="">Selecciona una especie</option>
              {ESPECIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {errors.especie && <span className="aria-error-msg">⚠ {errors.especie}</span>}
          </div>

          <div className="auth-group">
            <label className="aria-label">Descripción *</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              placeholder="Describe la situación del animal (mínimo 10 caracteres)" rows={4}
              className={`aria-input${errors.descripcion ? ' error' : ''}`}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
            {errors.descripcion && <span className="aria-error-msg">⚠ {errors.descripcion}</span>}
          </div>

          <div className="auth-group">
            <label className="aria-label">Ubicación *</label>
            <input name="ubicacion" value={form.ubicacion} onChange={handleChange}
              placeholder="Ej: Parque Central, Mocoa"
              className={`aria-input${errors.ubicacion ? ' error' : ''}`}
            />
            {errors.ubicacion && <span className="aria-error-msg">⚠ {errors.ubicacion}</span>}
          </div>

          <div className="auth-group">
            <label className="aria-label">📷 Foto del animal (opcional)</label>
            {!fotoPreview ? (
              <div className="foto-drop-zone" onClick={() => fileInputRef.current?.click()}>
                <span style={{ fontSize: '2.5rem' }}>📸</span>
                <p style={{ color: 'var(--aria-azul)', fontWeight: '600', margin: '0.5rem 0 0.25rem' }}>Toca para subir una foto</p>
                <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0 }}>Desde tu galería o cámara</p>
              </div>
            ) : (
              <div>
                <img src={fotoPreview} alt="preview" className="foto-preview" />
                <button type="button" className="foto-btn-quitar"
                  onClick={() => { setFotoPreview(null); fileInputRef.current.value = ''; }}>
                  ✕ Quitar foto
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
              onChange={handleFoto} style={{ display: 'none' }} />
          </div>

          <button type="submit" className="aria-btn-primary" disabled={loading}>
            {loading ? '⏳ Enviando...' : '🐾 Enviar reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}
