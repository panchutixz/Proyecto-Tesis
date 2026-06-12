import { useEffect, useState } from "react";

const AccesoDenegado = () => {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    if (seconds === 0) {
      clearInterval(timer);
      window.location.replace("/");
    }

    return () => clearInterval(timer);
  }, [seconds]);

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex justify-center items-center z-[9999]">
      <div className="bg-gray-800/40 border border-white/5 p-10 rounded-2xl max-w-md w-11/12 text-center text-white shadow-2xl backdrop-blur-md">
        
        {/* Icono de Advertencia Limpio */}
        <div className="text-amber-500 text-5xl mb-4 flex justify-center">
          ⚠️
        </div>
        
        {/* Título */}
        <h2 className="text-2xl font-bold mb-3 tracking-wide">
          Acceso no disponible
        </h2>
        
        {/* Descripción */}
        <p className="text-gray-400 text-sm mb-6 leading-relaxed px-2">
          No tienes permiso para acceder a esta sección sin iniciar sesión o no tienes los permisos necesarios. 
        </p>
        
        {/* Alerta del Contador */}
        <div className="bg-blue-950/50 border border-blue-800/60 p-4 rounded-xl mb-6 text-center text-sm text-blue-200 relative">
          Serás redirigido a la página de inicio de sesión en <strong className="text-blue-400 text-base mx-1">{seconds}</strong> segundos.
        </div>

        {/* Botón de Acción Forzada */}
        <button 
          onClick={() => window.location.replace("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-900/30"
        >
          Volver al inicio de sesión
        </button>
        
        {/* Código de error unificado al fondo */}
        <span className="block text-xs text-gray-600 mt-6 tracking-tight">
          Código de error: NO_ACCESS_PERMISSION
        </span>
      </div>
    </div>
  );
};

export default AccesoDenegado;