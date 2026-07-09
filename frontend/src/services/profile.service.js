import axios from '@services/root.service.js';

export async function getProfile() {
  try {
    const response = await axios.get('/profile/private');
    return response.data; // contiene { status, message, data }
  } catch (error) {
    return error.response?.data || { message: 'Error al obtener perfil' };
  }
}

export async function updateProfile(profileData) {
  try {
    const response = await axios.patch('/profile/private', profileData);
    return response.data;
  } catch (error) {
    return error.response?.data || { message: 'Error al actualizar perfil' };
  }
}

export async function eliminateProfile() {
  try {
    const response = await axios.delete('/profile/private');
    return response.data;
  } catch (error) {
    return error.response?.data || { message: 'Error al eliminar perfil' };
  }
}

export async function uploadProfileImage(formData) {
  try {
    const response = await axios.post('/profile/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // contiene { status, message, data: { userId, path } }
  } catch (error) {
    return error.response?.data || { message: 'Error al subir imagen' };
  }
}
