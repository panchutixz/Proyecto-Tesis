import Swal from "sweetalert2";
import { CreateUsers } from "@services/usuarios.service.js";

async function addUserPopup() {
  const { value: formValues } = await Swal.fire({
    title: "Añadir Usuario",
    width: 640,
    html: `
      <style>
        .sf-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left;margin-top:8px}
        .sf-form .full{grid-column:1/-1}
        .sf-form label{display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px}
        .sf-form input,.sf-form select{width:100%;height:40px;padding:0 12px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:14px;color:#1a1f5e;box-sizing:border-box;appearance:none;-webkit-appearance:none}
        .sf-form input:focus,.sf-form select:focus{outline:none;border-color:#4a90d9;background:#fff}
        .sf-form select{
          background-image: linear-gradient(45deg, transparent 50%, #5b78a2 50%), linear-gradient(135deg, #5b78a2 50%, transparent 50%);
          background-position: calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          cursor: pointer;
        }
        .sf-form select:invalid { color: #a0b0c8; }
      </style>

      <div class="sf-form">

        <div>
          <label for="swal2-rut">RUT</label>
          <input id="swal2-rut" placeholder="12.345.678-9" />
        </div>

        <div>
          <label for="swal2-nombre">Nombre</label>
          <input id="swal2-nombre" placeholder="Nombre del usuario" />
        </div>

        <div>
          <label for="swal2-apellido">Apellido</label>
          <input id="swal2-apellido" placeholder="Apellido del usuario" />
        </div>

        <div>
          <label for="swal2-email">Email</label>
          <input id="swal2-email" type="email" placeholder="correo@gmail.com" />
        </div>

        <div>
          <label for="swal2-password">Contraseña</label>
          <input id="swal2-password" type="password" placeholder="••••••••" />
        </div>

        <div>
          <label for="swal2-telefono">Teléfono</label>
          <input id="swal2-telefono" placeholder="+56 9 1234 5678" />
        </div>

        <div>
          <label for="swal2-rol">Rol</label>
          <select id="swal2-rol">
            <option value="" disabled selected>Seleccionar...</option>
            <option value="Empleado">Empleado</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Bodeguero">Bodeguero</option>
          </select>
        </div>

        <div>
          <label for="swal2-jornada">Jornada</label>
          <select id="swal2-jornada">
            <option value="" disabled selected>Seleccionar...</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Administrativa">Administrativa</option>
          </select>
        </div>

      </div>
    `,

    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Añadir Usuario",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#1a1f5e",
    showLoaderOnConfirm: true,

    preConfirm: async () => {
      const rut       = document.getElementById("swal2-rut").value.trim();
      const nombre    = document.getElementById("swal2-nombre").value.trim();
      const apellido  = document.getElementById("swal2-apellido").value.trim();
      const email     = document.getElementById("swal2-email").value.trim();
      const password  = document.getElementById("swal2-password").value;
      const rol       = document.getElementById("swal2-rol").value;
      const telefono  = document.getElementById("swal2-telefono").value.trim();
      const jornada   = document.getElementById("swal2-jornada").value;

      if (!rut || !nombre || !apellido || !email || !rol || !password || !jornada || !telefono) {
        Swal.showValidationMessage("Por favor, complete todos los campos obligatorios.");
        return false;
      }

      const payload = { rut, nombre, apellido, email, password, rol, telefono, jornada };

      try {
        const response = await CreateUsers(payload);
        return response;
      } catch (error) {
        console.error("Error capturado en el preConfirm:", error);
        const errorMessage = error.response?.data?.message || error.message || "Error interno del servidor.";
        Swal.showValidationMessage(errorMessage);
        return false;
      }
    },
  });

  return formValues || null;
}

export const useCreateUser = (fetchUsers) => {
  const handleCreateUser = async () => {
    try {
      const isCreated = await addUserPopup();
      if (!isCreated) return;

      await Swal.fire({
        title: "¡Usuario añadido exitosamente!",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: "#1a1f5e",
      });

      await fetchUsers();

    } catch (error) {
      console.error("Error crítico en handleCreateUser:", error);
    }
  };
  return { handleCreateUser };
};

export default useCreateUser;