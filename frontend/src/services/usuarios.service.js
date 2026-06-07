import axios from '@services/root.service.js';


export async function GetUsers() {
    try {
        const response = await axios.get('/users');
        return response.data;
    } catch (error) {
        // reenviar el mensaje del backend para que el frontend lo muestre
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || JSON.stringify(error.response.data));
        }
        throw error;
    }
}

export async function DeleteUsers(userId){
    try{
        const response = await axios.delete(`/users/${userId}`);
        return response.data;
    }catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || JSON.stringify(error.response.data));
        }
        throw error;
    }
}

export async function editUser(userId, userData) { 
    try {
        const response = await axios.put(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || JSON.stringify(error.response.data));
        }
        throw error;
    }
}

export async function CreateUsers(userData) {
    try{
        const response = await axios.post("/users/", userData);
        return response.data;
    }catch(error) {
        // Propagar mensaje de validación del backend
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || JSON.stringify(error.response.data));
        }
        throw error;
    }
}
    export async function getProfile() { 
    try {
        const response = await axios.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        throw error;
    }
    
}