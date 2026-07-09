import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Inicializamos el estado de manera SÍNCRONA leyendo las cookies y el almacenamiento
    const [user, setUser] = useState(() => {
        const token = cookies.get('jwt-auth');
        const storedUser = sessionStorage.getItem('usuario');

        if (token && storedUser) {
            try {
                const decoded = jwtDecode(token);
                // Validamos si el token sigue vigente
                if (decoded.exp * 1000 > Date.now()) {
                    return JSON.parse(storedUser); // Si es válido, este será el usuario inicial
                } else {
                    // Si expiró, limpiamos
                    cookies.remove('jwt-auth');
                    sessionStorage.removeItem('usuario');
                }
            } catch (error) {
                console.error('Error al decodificar token en la inicialización:', error);
                cookies.remove('jwt-auth');
                sessionStorage.removeItem('usuario');
            }
        }
        return null; // Si no hay sesión válida, arranca en null
    });

    // Mantenemos un useEffect opcional por si necesitas reaccionar a cambios externos en las cookies
    useEffect(() => {
        const token = cookies.get('jwt-auth');
        const storedUser = sessionStorage.getItem('usuario');
        
        if (!token || !storedUser) {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};