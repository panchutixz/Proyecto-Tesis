import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // 1. SI NO HAY USUARIO (Alguien cerró sesión e intentó volver atrás con las flechas)
  if (!user) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  // 2. CONTROL DE ROLES (Opcional, por si tu main.jsx pide roles en la ruta /usuarios)
  const userRole = user?.rol || user?.role || "";
  if (allowedRoles && !allowedRoles.includes(userRole.toLowerCase())) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
};

export default ProtectedRoute;