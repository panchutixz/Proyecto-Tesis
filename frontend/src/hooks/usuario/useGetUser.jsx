import { useState } from 'react';
import { GetUsers } from '@services/usuarios.service.js';

export const useGetUsers = () => {
    const [users, setUsers] = useState([]);
    
        const fetchUsers = async () => {
            try {
                const data = await GetUsers();
                setUsers(data.data);
            } catch (error) {
                console.error("Error al obtener a los usuarios:", error);
            }
        };

    return { users,setUsers, fetchUsers };

}

export default useGetUsers;