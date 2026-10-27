import axios from '@services/root.service.js';

export async function GetAsistencia(jornada) {
  try {
    const response = await axios.get(`/asistencias?jornada=${encodeURIComponent(jornada)}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export async function GuardarAsistencia(asistenciaData) {
  // asistenciaData = { jornada, registros: [{ trabajadorId, presente, motivo, comentario }] }
  try {
    const response = await axios.post('/asistencias', asistenciaData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data));
    }
    throw error;
  }
}