import axios from '@services/root.service.js';

export async function getTareas() {
  const res = await axios.get('/tareas');
  return res.data;
}

export async function createTarea(data) {
  const res = await axios.post('/tareas', data);
  return res.data;
}

export async function updateTarea(id, data) {
  const res = await axios.put(`/tareas/${id}`, data);
  return res.data;
}

export async function deleteTarea(id) {
  const res = await axios.delete(`/tareas/${id}`);
  return res.data;
}

export async function updateSubtareaEstado(tareaId, subtareaId, estado) {
  const res = await axios.patch(`/tareas/${tareaId}/subtareas/${subtareaId}/estado`, { estado });
  return res.data;
}

export async function uploadEvidencia(tareaId, file) {
  const form = new FormData();
  form.append('evidencia', file);
  const res = await axios.post(`/tareas/${tareaId}/evidencia`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ── Subtareas automáticas por departamento + actividad ────────────────────
export const SUBTAREAS_POR_DEPARTAMENTO = {
  'FACE': {
    'Limpiar Baños':  ['Limpiar lavamanos','Rellenar papel higiénico','Reponer jabón de mano','Limpiar piso','Limpiar vidrios'],
    'Aseo General':   ['Barrer pasillos','Trapear pisos','Vaciar basureros','Limpiar ventanas'],
  },
  'Gimnasio': {
    'Limpiar Cancha': ['Barrer cancha','Limpiar vestuarios','Vaciar basureros','Trapear baños'],
    'Aseo General':   ['Limpiar máquinas','Barrer sala de pesas','Limpiar espejos','Vaciar basureros'],
  },
  'Auditorio': {
    'Sanitizar Auditorio': ['Limpiar butacas','Barrer escenario','Limpiar baños auditorio','Vaciar basureros'],
    'Aseo General':        ['Aspirar alfombras','Limpiar palco','Trapear pasillos'],
  },
  'Biblioteca': {
    'Aseo Biblioteca': ['Aspirar alfombras','Limpiar estantes','Vaciar papeleras','Limpiar mesas'],
    'Aseo General':    ['Barrer pisos','Limpiar vidrios','Trapear pasillos','Vaciar basureros'],
  },
  'Casino': {
    'Limpiar Casino': ['Limpiar mesas','Trapear pisos','Limpiar cocina','Vaciar basureros','Limpiar vitrinas'],
    'Aseo General':   ['Barrer accesos','Limpiar baños','Vaciar basureros','Trapear pasillos'],
  },
  'Baños Generales': {
    'Limpiar Baños':  ['Limpiar lavamanos','Rellenar papel higiénico','Reponer jabón de mano','Limpiar piso','Desinfectar inodoros'],
    'Aseo General':   ['Limpiar espejos','Vaciar basureros','Limpiar paredes','Reponer insumos'],
  },
  'Otro': {
    'Aseo General': ['Barrer área','Trapear pisos','Vaciar basureros','Limpiar superficies'],
  },
};

export const DEPARTAMENTOS = Object.keys(SUBTAREAS_POR_DEPARTAMENTO);

export function getActividadesPorDepartamento(depto) {
  return Object.keys(SUBTAREAS_POR_DEPARTAMENTO[depto] || {});
}

export function getSubtareasPorDepartamentoYActividad(depto, actividad) {
  return SUBTAREAS_POR_DEPARTAMENTO[depto]?.[actividad] || [];
}