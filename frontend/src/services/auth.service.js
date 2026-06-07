import axios from './root.service.js';
import cookies from 'js-cookie';

export async function login(dataUser) {
  try {
    const { email, password } = dataUser;
    const response = await axios.post("/auth/login", { email, password });

    // Ajusta según tu backend: si devuelve { data: { token, user } }
    const { token, user } = response.data.data || {};

    if (token) cookies.set("jwt-auth", token, { path: "/" });
    if (user) sessionStorage.setItem("usuario", JSON.stringify(user));

    return { status: response.status, data: response.data };
  } catch (error) {
    return {
      status: error.response?.status || 0,
      data: error.response?.data || { message: "Error al conectar con el servidor" },
    };
  }
}

export async function register(data) {
  try {
    const response = await axios.post('/auth/register', data);
    return { status: response.status, data: response.data };
  } catch (error) {
    return { status: error.response?.status || 0, data: error.response?.data || { message: 'Error al conectar con el servidor' } };
  }
}

export async function registerUser(nombre, apellido, rut, email, password, telefono, rol) {
  return await register({ nombre, apellido, rut, email, password, telefono, rol });
}

export async function logout() {
  try {
    sessionStorage.removeItem('usuario');
    cookies.remove('jwt-auth');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}
