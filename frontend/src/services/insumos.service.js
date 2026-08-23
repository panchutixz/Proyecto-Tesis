import axios from '@services/root.service.js';

export async function GetInsumos() {
  try {
    const response = await axios.get('/insumos');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export async function CreateInsumo(insumoData) {
  try {
    const response = await axios.post('/insumos', insumoData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export async function EntregarInsumos(entregaData) {
  // entregaData = { trabajadorId, trabajadorNombre, jornada, items: [{ insumoId, cantidad }] }
  try {
    const response = await axios.patch('/insumos/entregar', entregaData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export async function ReponerInsumos(reposicionData) {
  // reposicionData = { items: [{ insumoId, cantidad }] }
  try {
    const response = await axios.patch('/insumos/reponer', reposicionData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || JSON.stringify(error.response.data));
    }
    throw error;
  }
}