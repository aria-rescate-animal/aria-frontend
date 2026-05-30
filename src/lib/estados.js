// ─── Fuente única de verdad del frontend — estados, categorías, servicios ───
// Sincronizado con src/utils/aria.constants.js del backend

export const ESTADO_LABELS = {
  pendiente:         'Pendiente de atención',
  en_atencion:       'En atención',
  rescatado:         'Rescatado',
  no_procede:        'No procede',
  requiere_revision: 'Requiere revisión',
}

export const ESTADO_SHORT = {
  pendiente:         'Pendiente',
  en_atencion:       'En atención',
  rescatado:         'Rescatado',
  no_procede:        'No procede',
  requiere_revision: 'Revisión',
}

export const ESTADO_STYLE = {
  pendiente:         { dot: '#ef4444', badge: 'bg-red-50 text-red-700 border-red-200' },
  en_atencion:       { dot: '#f59e0b', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  rescatado:         { dot: '#16a34a', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  no_procede:        { dot: '#6b7280', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
  requiere_revision: { dot: '#7c3aed', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
}

export const PRIORIDAD_LABELS = {
  normal:  'Normal',
  urgente: 'Urgente',
}

export const PRIORIDAD_STYLE = {
  normal:  { cls: 'bg-slate-100 text-slate-600' },
  urgente: { cls: 'bg-red-100 text-red-700 font-bold' },
}

export const CATEGORIA_LABELS = {
  abandono:          'Abandonado',
  herido:            'Herido o accidentado',
  enfermo:           'Enfermo o débil',
  maltrato:          'Maltrato',
  cautiverio:        'Cautiverio inadecuado',
  fauna_silvestre:   'Fauna silvestre',
  no_estoy_seguro:   'No estoy seguro',
}

export const CATEGORIA_HELP = {
  abandono:        'Animal solo, en calle, sin responsable visible o en situación de abandono.',
  herido:          'Tiene una lesión visible, sangrado, fractura, fue atropellado o no puede moverse bien.',
  enfermo:         'Se ve decaído, débil, desorientado o con síntomas de enfermedad.',
  maltrato:        'Hay señales de agresión, violencia, descuido grave o daño intencional.',
  cautiverio:      'Está amarrado, encerrado, retenido o en condiciones inadecuadas.',
  fauna_silvestre: 'Es un animal no doméstico. Debe ser atendido por una entidad especializada.',
  no_estoy_seguro: 'Usa esta opción si no sabes clasificar el caso. Un administrador lo revisará.',
}

export const SERVICIOS_LABELS = {
  rescate_calle:        'Rescate de animales en calle',
  atencion_veterinaria: 'Atención veterinaria',
  hogar_temporal:       'Hogar temporal',
  maltrato:             'Casos de maltrato',
  cautiverio:           'Casos de cautiverio',
  fauna_silvestre:      'Fauna silvestre',
  adopcion_seguimiento: 'Adopción y seguimiento',
}

export const TIPOS_ENTIDAD_LABELS = {
  veterinaria:           'Veterinaria',
  fundacion:             'Fundación',
  autoridad_ambiental:   'Autoridad ambiental',
  rescatista_organizado: 'Rescatista organizado',
  hogar_temporal:        'Hogar temporal',
  otra:                  'Otra',
}

export const LEGACY_ESTADO = {
  urgente: 'pendiente',
  ['en' + ' proceso']: 'en_atencion',
  Activo: 'pendiente',
  'En Proceso': 'en_atencion',
  Rescatado: 'rescatado',
}

export const LEGACY_CATEGORIA = {
  abandonado: 'abandono',
  abandono: 'abandono',
  sin_dueno: 'abandono',
  animal_sin_dueno: 'abandono',
  desnutrido: 'enfermo',
  riesgo: 'no_estoy_seguro',
  otro: 'no_estoy_seguro',
  maltrato_cautiverio: 'maltrato',
}

export const normalizarEstado = (estado) =>
  LEGACY_ESTADO[estado] || estado || 'pendiente'

export const normalizarCategoria = (cat) =>
  LEGACY_CATEGORIA[cat] || cat || 'no_estoy_seguro'
