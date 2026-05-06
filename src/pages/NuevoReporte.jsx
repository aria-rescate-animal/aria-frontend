import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { crearReporte } from '../services/reportes.service';

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Reptil', 'Otro'];

export default function NuevoReporte() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ especie: '', descripcion: '', ubicacion: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [enviado, setEnviado]   = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const fileInputRef = useRef(null);

  const validar = () => {
    const e = {};
    if (!form.especie)              e.especie     = 'Selecciona una especie';
    if (!form.descripcion.trim())   e.descripcion = 'La descripcion es obligatoria';
    else if (form.descripcion.trim().length < 10) e.descripcion = 'Minimo 10 caracteres';
    if (!form.ubicacion.trim())     e.ubicacion   = 'La ubicacion es obligatoria';
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleQuitarFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      setLoading(true);
      setErrorEnvio('');
      await crearReporte({ ...form, fotoFile });
      setEnviado(true);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setErrorEnvio('No tienes permiso para crear reportes o tu sesion expiro.');
      } else if (err.code === 'ERR_NETWORK') {
        setErrorEnvio('No se pudo conectar con el servidor.');
      } else {
        setErrorEnvio(err.response?.data?.message || 'Error al enviar el reporte.');
      }
    } finally { setLoading(false); }
  };

  if (enviado) return (
    <div style={{ maxWidth: '560px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '64px', height: '64px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle2 size={32} color="#16a34a" />
        </div>
        <h2 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontWeight: '700' }}>Reporte enviado</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Tu reporte fue registrado. Las entidades seran notificadas de inmediato.</p>
        <button onClick={() => navigate('/reportes')} style={s.btnPrimario}>Ver feed de casos</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '580px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.75rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
          <ArrowLeft size={14} /> Atrás
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>Nuevo reporte</h1>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Reporta un animal en situacion de calle</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

        {errorEnvio && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.8rem' }}>
            {errorEnvio}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Especie */}
          <div>
            <label style={s.label}>Especie *</label>
            <select name="especie" value={form.especie} onChange={handleChange}
              style={{ ...s.input, ...(errors.especie ? s.inputErr : {}), marginTop: '0.3rem' }}>
              <option value="">Selecciona una especie</option>
              {ESPECIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            {errors.especie && <p style={s.errMsg}>{errors.especie}</p>}
          </div>

          {/* Descripcion */}
          <div>
            <label style={s.label}>Descripcion *</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
              placeholder="Describe la situacion del animal (minimo 10 caracteres)"
              rows={4}
              style={{ ...s.input, ...(errors.descripcion ? s.inputErr : {}), marginTop: '0.3rem', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {errors.descripcion && <p style={s.errMsg}>{errors.descripcion}</p>}
          </div>

          {/* Ubicacion */}
          <div>
            <label style={s.label}>Ubicacion *</label>
            <input name="ubicacion" value={form.ubicacion} onChange={handleChange}
              placeholder="Ej: Parque Central, Mocoa"
              style={{ ...s.input, ...(errors.ubicacion ? s.inputErr : {}), marginTop: '0.3rem' }}
            />
            {errors.ubicacion && <p style={s.errMsg}>{errors.ubicacion}</p>}
          </div>

          {/* Foto */}
          <div>
            <label style={s.label}>Foto del animal (opcional)</label>
            {!fotoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: '0.3rem', border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Camera size={20} color="#2563eb" />
                </div>
                <p style={{ margin: 0, color: '#2563eb', fontWeight: '600', fontSize: '0.875rem' }}>Subir foto</p>
                <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>Desde galeria o camara · Max 5MB</p>
              </div>
            ) : (
              <div style={{ marginTop: '0.3rem', position: 'relative' }}>
                <img src={fotoPreview} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
                <button type="button" onClick={handleQuitarFoto} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <X size={14} />
                </button>
                <p style={{ margin: '0.4rem 0 0', color: '#94a3b8', fontSize: '0.75rem' }}>{fotoFile?.name}</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: 'none' }} />
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btnPrimario, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Send size={15} />
            {loading ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#374151', display: 'block' },
  input: { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: 'white' },
  inputErr: { borderColor: '#ef4444', background: '#fef2f2' },
  errMsg: { color: '#dc2626', fontSize: '0.75rem', margin: '0.25rem 0 0' },
  btnPrimario: { width: '100%', padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '0.875rem', transition: 'background 0.15s' },
};
