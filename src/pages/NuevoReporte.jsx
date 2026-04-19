import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Reptil', 'Otro'];

export default function NuevoReporte() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ especie: '', descripcion: '', ubicacion: '', foto: '' });
  const [errors, setErrors] = useState({});
  const [enviado, setEnviado] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errores = validar();
    if (Object.keys(errores).length > 0) { setErrors(errores); return; }
    console.log('📋 Nuevo reporte:', form);
    setEnviado(true);
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
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Tu reporte fue capturado. Revisa la consola para ver los datos.</p>
        <button style={styles.btnPrimary} onClick={() => navigate('/reportes')}>Volver al Feed</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        input:focus, textarea:focus, select:focus { border-color: #1565C0 !important; box-shadow: 0 0 0 3px rgba(21,101,192,0.13); outline: none; }
      `}</style>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Atrás</button>
        <h1 style={styles.title}>Nuevo Reporte</h1>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          {/* Especie */}
          <div style={styles.group}>
            <label style={styles.label}>Especie *</label>
            <select name="especie" value={form.especie} onChange={handleChange} style={inputStyle('especie')}>
              <option value="">Selecciona una especie</option>
              {ESPECIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {errors.especie && <span style={styles.errorMsg}>⚠ {errors.especie}</span>}
          </div>

          {/* Descripción */}
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

          {/* Ubicación */}
          <div style={styles.group}>
            <label style={styles.label}>Ubicación *</label>
            <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Parque Central, Mocoa" style={inputStyle('ubicacion')} />
            {errors.ubicacion && <span style={styles.errorMsg}>⚠ {errors.ubicacion}</span>}
          </div>

          {/* Foto */}
          <div style={styles.group}>
            <label style={styles.label}>URL de foto (opcional)</label>
            <input name="foto" value={form.foto} onChange={handleChange} placeholder="https://..." style={inputStyle('foto')} />
            {form.foto && (
              <img src={form.foto} alt="preview" style={styles.preview} onError={(e) => e.target.style.display = 'none'} />
            )}
          </div>

          <button type="submit" style={styles.btnPrimary}>🐾 Enviar reporte</button>
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
  preview: { marginTop: '0.6rem', width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px' },
  btnPrimary: { width: '100%', padding: '0.9rem', background: 'linear-gradient(90deg,#1565C0,#0097A7)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 4px 15px rgba(21,101,192,0.3)' },
  successPage: { minHeight: '100vh', background: '#F0F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successCard: { background: 'white', borderRadius: '20px', padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(10,36,99,0.1)', maxWidth: '400px' },
};
