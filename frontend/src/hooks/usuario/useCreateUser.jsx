import Swal from "sweetalert2";
import { CreateUsers } from "@services/usuarios.service.js";

async function addUserPopup() {
  // Guardamos la respuesta final en una variable
  const { value: formValues } = await Swal.fire({
    title: "Añadir Usuario",
    html: `
        <div>
          <label for="swal2-rut">Rut</label>
          <input id="swal2-rut" class="swal2-input" placeholder="Rut del usuario">
        </div>
        <div>
          <label for="swal2-nombre">Nombre</label>
          <input id="swal2-nombre" class="swal2-input" placeholder="Nombre del usuario">
        </div>
        <div>
          <label for="swal2-apellido">Apellido</label>
          <input id="swal2-apellido" class="swal2-input" placeholder="Apellido del usuario">
        </div>
        <div>
          <label for="swal2-email">Email</label>
          <input id="swal2-email" class="swal2-input" placeholder="Email del usuario">
        </div>
        <div>
          <label for="swal2-password">Contraseña</label>
          <input id="swal2-password" type="password" class="swal2-input" placeholder="Contraseña del usuario">
        </div>
        <div>
          <label for="swal2-rol">Rol</label>
          <select id="swal2-rol" class="swal2-input swal2-select">
            <option value="" disabled selected>Seleccione el rol</option>
            <option value="Empleado">Empleado</option>
          </select>
        </div>
        <div>
          <label for="swal2-telefono">Teléfono</label>
          <input id="swal2-telefono" class="swal2-input" placeholder="Teléfono del usuario">
        </div>
        <div>
          <label for="swal2-jornada">Jornada</label>
          <select id="swal2-jornada" class="swal2-input swal2-select">
            <option value="" disabled selected>Seleccione la jornada</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Administrativa">Administrativa</option>
          </select>
        </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Añadir",
    showLoaderOnConfirm: true, // Muestra una animación de carga mientras se ejecuta preConfirm
    didOpen: () => {
      const popup = Swal.getPopup();
      const style = document.createElement('style');
      style.innerHTML = `
        .swal2-select {
          height: 44px !important;
          padding: 8px 36px 8px 12px !important;
          box-sizing: border-box !important;
          border-radius: 4px !important;
          border: 1px solid #d9d9d9 !important;
          background-color: #fff !important;
          font-size: 14px !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          background-image: linear-gradient(45deg, transparent 50%, #555 50%), linear-gradient(135deg, #555 50%, transparent 50%);
          background-position: calc(100% - 18px) calc(50% - 6px), calc(100% - 12px) calc(50% - 6px);
          background-size: 8px 8px, 8px 8px;
          background-repeat: no-repeat;
          cursor: pointer;
        }
        .swal2-html-container > div { display:block; margin-bottom:12px; }
        .swal2-html-container label { display:block; margin-bottom:6px; font-weight:500; color:#333; }
        /* Estilo opcional para que el mensaje de validación se vea más limpio */
        .swal2-validation-message { margin: 10px 0 0 0 !important; }
      `;
      popup.appendChild(style);
    },
    // Volvemos asíncrono el preConfirm para golpear la API aquí dentro
    preConfirm: async () => {
      const rut = document.getElementById("swal2-rut").value.trim();
      const nombre = document.getElementById("swal2-nombre").value.trim();
      const apellido = document.getElementById("swal2-apellido").value.trim();
      const email = document.getElementById("swal2-email").value.trim();
      const password = document.getElementById("swal2-password").value;
      const rol = document.getElementById("swal2-rol").value;
      const telefono = document.getElementById("swal2-telefono").value.trim();
      const jornada = document.getElementById("swal2-jornada").value;

      // 1. Validación de campos requeridos locales
      if (!rut || !nombre || !apellido || !email || !rol || !password || !jornada || !telefono) {
        Swal.showValidationMessage("Por favor, complete todos los campos obligatorios");
        return false;
      }

      const payload = { rut, nombre, apellido, email, password, rol, telefono, jornada };

      try {
        // 2. Ejecutamos la petición directamente AQUÍ antes de cerrar el modal
        const response = await CreateUsers(payload);
        
        // Si todo sale bien, retornamos true para que el popup se cierre con éxito
        return response;
      } catch (error) {
        console.error("Error capturado en el preConfirm:", error);
        
        // 3. Extraemos el mensaje de error del backend (soporta Axios y Fetch)
        const errorMessage = error.response?.data?.message || error.message || "Error interno del servidor.";
        
        // 4. Mostramos el error del backend abajo del formulario e impedimos el cierre
        Swal.showValidationMessage(errorMessage);
        return false;
      }
    },
  });

  // Si formValues contiene la respuesta exitosa del backend, la retornamos
  return formValues || null;
}

export const useCreateUser = (fetchUsers) => {
  const handleCreateUser = async () => {
    try {
      const isCreated = await addUserPopup();
      
      // Si el usuario canceló o hubo error, la función se detiene sin cerrar/romper nada
      if (!isCreated) return;

      // Si llegó aquí es porque la API respondió 201 exitosamente desde el preConfirm
      await Swal.fire({
        title: "Usuario añadido exitosamente!",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 2000,
        timerProgressBar: true
      });
      
      await fetchUsers();

    } catch (error) {
      console.error("Error crítico en handleCreateUser:", error);
    }
  };
  return { handleCreateUser };
};

export default useCreateUser;