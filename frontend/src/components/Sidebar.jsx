import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth.service";

const Sidebar = () => {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // Controla si el drawer está abierto en modo celular (en desktop siempre se ve)
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("usuario")) || null;
  const displayName = user?.nombre || user?.name || user?.username || "Usuario";
  const userRole = user?.rol || user?.role || "";

  // Cierra el drawer luego de navegar (solo tiene efecto en mobile)
  const goTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Se ejecuta solo si el usuario confirma el cierre en el modal
  const handleLogoutConfirm = () => {
    try {
      logout(); // Remueve cookies ('jwt-auth') y sessionStorage ('usuario')
      window.location.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <>
      {/* Botón hamburguesa — solo visible en celular */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 bg-gray-800 text-white p-2 rounded-md shadow-lg"
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Fondo oscuro al abrir el drawer en celular */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* CONTENEDOR SIDEBAR */}
      <div
        className={`w-64 h-screen bg-gray-800 text-white flex flex-col fixed top-0 left-0 z-50
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
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
                onClick={() => goTo("/home")}
                className="w-full text-left hover:bg-gray-700 p-2 rounded"
              >
                Inicio
              </button>
            </li>

            {/* Usuarios */}
            {["administrador"].includes(userRole?.toLowerCase()) && (
             <li>
               <button
                  onClick={() => goTo("/usuarios")}
                  className="w-full text-left hover:bg-gray-700 p-2 rounded"
               >
                 Usuarios
              </button>
            </li>
            )}
            
            {/* Tareas — todos los roles */}
            <li>
              <button
                onClick={() => goTo('/tareas')}
                className="w-full text-left hover:bg-gray-700 p-2 rounded"
              >
                Tareas
              </button>
            </li>

            {/* Perfil */}
            <li>
              <button
                  onClick={() => goTo("/profile")}
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
                onClick={() => {
                  setShowLogoutModal(true);
                  setMobileOpen(false); // Opcional: cierra la barra en celular al abrir el modal
                }}
                className="w-full text-left hover:bg-red-700 bg-red-600 p-2 rounded"
              >
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN 
        Ubicado afuera del contenedor principal de la Sidebar para que herede el viewport completo y no se oculte.
      */}
      {showLogoutModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-container">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="modal-title">¿Desea cerrar sesión?</h3>
            <p className="modal-text">
              Se cerrará tu sesión activa en este dispositivo. Tendrás que autenticarte de nuevo para ingresar.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="modal-btn-cancelar"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="modal-btn-confirmar"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;