import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../services/auth.service";


const Sidebar = () => {
  const navigate = useNavigate();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("usuario")) || null;
  const displayName = user?.nombre || user?.name || user?.username || "Usuario";
  const userRole = user?.rol || user?.role || "";

  // Se ejecuta solo si el usuario confirma el cierre en el modal
  const handleLogoutConfirm = () => {
    try {
      logout(); // Remueve cookies ('jwt-auth') y sessionStorage ('usuario')
      
      // Al salir voluntariamente, destruimos el estado síncronamente 
      // y mandamos al usuario directo a la raíz del Login
      window.location.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col fixed top-0 left-0 z-50">

      {/* Encabezado */}
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Aseo San Francisco
      </div>

      {/* Info Usuario */}
      <div className="p-4 border-b border-gray-700">
        {displayName ? (
          <div>
            <p className="text-sm">Hola, <strong>{displayName}</strong></p>
            {userRole && <p className="text-xs text-gray-300">{userRole}</p>}
          </div>
        ) : (
          <p className="text-sm">Usuario</p>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-6">
        <ul className="space-y-4">

          {/* Inicio */}
          <li>
            <button
              onClick={() => navigate("/home")}
              className="w-full text-left hover:bg-gray-700 p-2 rounded"
            >
              Inicio
            </button>
          </li>

          {/* Usuarios */}
          {["administrador"].includes(userRole?.toLowerCase()) && (
           <li>
             <button
                onClick={() => navigate("/usuarios")}
                className="w-full text-left hover:bg-gray-700 p-2 rounded"
             >
               Usuarios
            </button>
          </li>
          )}

          {/* Perfil */}
          <li>
            <button
                onClick={() => navigate("/profile")}
                className="w-full text-left hover:bg-gray-700 p-2 rounded"
             >
               Perfil
            </button>
          </li>

          {/* Espaciador para empujar el logout al fondo */}
          <li className="flex-grow" />

          {/* Cerrar Sesión */}
          <li>
            <button
              onClick={() => setShowLogoutModal(true)} // Abre el modal personalizado
              className="w-full text-left hover:bg-red-700 bg-red-600 p-2 rounded"
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="modal-title">¿Desea cerrar sesión?</h3>
            <p className="modal-text">
              Se cerrará tu sesión activa en este dispositivo. Tendrás que autenticarte de nuevo para ingresar.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowLogoutModal(false)} // Cancela y cierra el modal
                className="modal-btn-cancelar"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm} // Destruye sesión y redirige
                className="modal-btn-confirmar"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sidebar;