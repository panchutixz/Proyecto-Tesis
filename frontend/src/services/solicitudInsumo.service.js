import axios from '@services/root.service.js';

export async function getSolicitudes() {
  const res = await axios.get('/solicitudes-insumo');
  return res.data;
}

export async function crearSolicitud(data) {
  const res = await axios.post('/solicitudes-insumo', data);
  return res.data;
}

export async function resolverSolicitud(id, accion, comentario) {
  const res = await axios.patch(`/solicitudes-insumo/${id}/resolver`, { accion, comentario });
  return res.data;
}