// Issue #17 - UI: Formulario de Nuevo Reporte y Validaciones
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearReporte } from '../services/reportes.service';

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Reptil', 'Otro'];

export default function NuevoReporte() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ especie: '', descripcion: '', ubicacion: '' });
  const [fotoFile, setFotoFile] = useState(null);
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
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleQuitarFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = validar();
    if (Object.keys(errores).length > 0) { setErrors(errores); return; }

    try {
      setLoading(true);
      // Por ahora se envía la foto como base64 o null
      await crearReporte({ 
        ...form, 
        estado: 'urgente',
        foto: fotoPreview || null
      });
    } catch {
      console.log('📋 Nuevo reporte (mock):', form);
    } finally {
      setLoading(false);
      setEnviado(true);
    }
  };

  const inputStyle = (campo) => ({
    ...styles.input,
    border: errors[campo] ? '1.5px solid #C62828' : '1.5px solid #BBDEFB',
    background: errors[campo] ? '#FFF8F8' : '#F8FBFF',
  });

  if (enviado) return (
    <div style={styles.successPage}>
      <div style={styles.successCard}>
        <span style={{ fontSize: '3.5rem' }}>🐾</span>
        <h2 style={{ color: '#0A2463', margin: '0.75rem 0 0.5rem' }}>¡Reporte enviado!</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Tu reporte fue registrado correctamente.</p>
        <button style={styles.btnPrimary} onClick={() => navigate('/reportes')}>Ver Feed de Rescates</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        input:focus, textarea:focus, select:focus { border-color: #1565C0 !important; box-shadow: 0 0 0 3px rgba(21,101,192,0.13); outline: none; }
        button[type="submit"]:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        button[type="submit"] { transition: all 0.2s; }
        .foto-drop:hover { border-color: #1565C0 !important; background: #EEF4FF !important; }
      `}</style>

      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Atrás</button>
        <h1 style={styles.title}>Nuevo Reporte</h1>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Especie *</label>
            <select name="especie" value={form.especie} onChange={handleChange} style={inputStyle('especie')}>
              <option value="">Selecciona una especie</option>
              {ESPECIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {errors.especie && <span style={styles.errorMsg}>⚠ {errors.especie}</span>}
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Descripción *</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Describe la situación del animal (mínimo 10 caracteres)"
              rows={4}
              style={{ ...inputStyle('descripcion'), resize: 'vertical', fontFamily: 'inherit' }}
            />
            {errors.descripcion && <span style={styles.errorMsg}>⚠ {errors.descripcion}</span>}
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Ubicación *</label>
            <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Parque Central, Mocoa" style={inputStyle('ubicacion')} />
            {errors.ubicacion && <span style={styles.errorMsg}>⚠ {errors.ubicacion}</span>}
          </div>

          {/* Campo de foto mejorado */}
          <div style={styles.group}>
            <label style={styles.label}>📷 Foto del animal (opcional)</label>
            
            {!fotoPreview ? (
              <div
                className="foto-drop"
                style={styles.fotoDropZone}
                onClick={() => fileInputRef.current?.click()}
              >
                <span style={{ fontSize: '2.5rem' }}>📸</span>
                <p style={{ color: '#1565C0', fontWeight: '600', margin: '0.5rem 0 0.25rem' }}>
                  Toca para subir una foto
                </p>
                <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0 }}>
                  Desde tu galería o cámara
                </p>
              </div>
            ) : (
              <div style={styles.fotoPreviewWrapper}>
                <img src={fotoPreview} alt="preview" style={styles.preview} />
                <button type="button" style={styles.btnQuitarFoto} onClick={handleQuitarFoto}>
                  ✕ Quitar foto
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFoto}
              style={{ display: 'none' }}
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
          >
            {loading ? '⏳ Enviando...' : '🐾 Enviar reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#F0F6FF', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' },
  header: { maxWidth: '560px', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' },
  backBtn: { background: 'none', border: 'none', color: '#1565C0', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' },
  title: { color: '#0A2463', fontSize: '1.5rem', fontWeight: '800', margin: 0 },
  card: { background: 'white', borderRadius: '20px', boxShadow: '0 8px 32px rgba(10,36,99,0.1)', padding: '2rem', maxWidth: '560px', margin: '0 auto' },
  group: { marginBottom: '1.1rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#0A2463', fontSize: '0.88rem', fontWeight: '600' },
  input: { width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', color: '#333', transition: 'border 0.2s, box-shadow 0.2s' },
  errorMsg: { color: '#C62828', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' },
  fotoDropZone: { border: '2px dashed #BBDEFB', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#F8FBFF', transition: 'all 0.2s' },
  fotoPreviewWrapper: { position: 'relative' },
  preview: { width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '12px', display: 'block' },
  btnQuitarFoto: { marginTop: '0.5rem', background: '#FFF0F0', color: '#C62828', border: '1px solid #FADADD', borderRadius: '8px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', width: '100%' },
  btnPrimary: { width: '100%', padding: '0.9rem', background: 'linear-gradient(90deg,#1565C0,#0097A7)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', marginTop: '0.5rem', boxShadow: '0 4px 15px rgba(21,101,192,0.3)' },
  successPage: { minHeight: '100vh', background: '#F0F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successCard: { background: 'white', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(10,36,99,0.1)', maxWidth: '400px' },
};
