import Swal from "sweetalert2";
import { editUser } from "@services/usuarios.service.js";


async function editUserPopup(user) {
  // 1. Obtener el usuario logueado desde la sesión
  const currentUser = JSON.parse(sessionStorage.getItem("usuario"));
  const isSelfEdit = currentUser && currentUser.id === user.id;

  const { value: formValues } = await Swal.fire({
    title: isSelfEdit ? "Editar Mis Datos" : "Editar Usuario",
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
        .sf-form input:disabled, .sf-form select:disabled {
          background-color: #e9eef7 !important;
          color: #8c9bb5 !important;
          cursor: not-allowed;
        }
      </style>

      <div class="sf-form">

        <div>
          <label for="swal2-nombre">Nombre</label>
          <input id="swal2-nombre" value="${user.nombre || ""}" placeholder="Nombre del usuario" />
        </div>

        <div>
          <label for="swal2-apellido">Apellido</label>
          <input id="swal2-apellido" value="${user.apellido || ""}" placeholder="Apellido del usuario" />
        </div>

        <div class="full">
          <label for="swal2-email">Email</label>
          <input id="swal2-email" type="email" value="${user.email || ""}" placeholder="correo@gmail.com" />
        </div>

        <div>
          <label for="swal2-rol">Rol</label>
          <select id="swal2-rol" ${isSelfEdit ? "disabled" : ""}>
            <option value="" disabled>Seleccionar...</option>
            <option value="Administrador" ${user.rol?.toLowerCase() === "administrador" ? "selected" : ""}>Administrador</option>
            <option value="Empleado" ${user.rol?.toLowerCase() === "empleado" ? "selected" : ""}>Empleado</option>
            <option value="Supervisor" ${user.rol?.toLowerCase() === "supervisor" ? "selected" : ""}>Supervisor</option>
            <option value="Bodeguero" ${user.rol?.toLowerCase() === "bodeguero" ? "selected" : ""}>Bodeguero</option>
          </select>
        </div>

        <div>
          <label for="swal2-telefono">Teléfono</label>
          <input id="swal2-telefono" value="${user.telefono || ""}" placeholder="+56 9 1234 5678" />
        </div>

        <div>
          <label for="swal2-jornada">Jornada</label>
          <select id="swal2-jornada" ${isSelfEdit ? "disabled" : ""}>
            <option value="" disabled>Seleccionar...</option>
            <option value="Mañana" ${user.jornada === "Mañana" ? "selected" : ""}>Mañana</option>
            <option value="Tarde" ${user.jornada === "Tarde" ? "selected" : ""}>Tarde</option>
            <option value="Administrativa" ${user.jornada === "Administrativa" ? "selected" : ""}>Administrativa</option>
          </select>
        </div>

        <div>
          <label for="swal2-estado">Estado</label>
          <select id="swal2-estado" ${isSelfEdit ? "disabled" : ""}>
            <option value="" disabled>Seleccionar...</option>
            <option value="Activo" ${user.estado === "Activo" ? "selected" : ""}>Activo</option>
            <option value="Licencia" ${user.estado === "Licencia" ? "selected" : ""}>Licencia</option>
            <option value="Inactivo" ${user.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
          </select>
        </div>

      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar cambios",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#1a1f5e",
    preConfirm: () => {
      const nombre = document.getElementById("swal2-nombre").value.trim();
      const apellido = document.getElementById("swal2-apellido").value.trim();
      const email = document.getElementById("swal2-email").value.trim();
      const telefono = document.getElementById("swal2-telefono").value.trim();

      // Si está deshabilitado el select, extraemos el valor original que ya tenía el usuario
      const rol = document.getElementById("swal2-rol").value || user.rol;
      const jornada = document.getElementById("swal2-jornada").value || user.jornada;
      const estado = document.getElementById("swal2-estado").value || user.estado;

      if (!nombre || !apellido || !email || !rol || !telefono || !jornada || !estado) {
        Swal.showValidationMessage("Por favor, complete todos los campos obligatorios");
        return false;
      }

      return { nombre, apellido, email, rol, telefono, jornada, estado };
    },
  });

  return formValues || null;
}

export const useEditUser = (fetchUsers) => {
  const handleEditUser = async (userId, userData) => {
    try {
      const formValues = await editUserPopup(userData);
      if (!formValues) return;

      const response = await editUser(userId, formValues);
      if (response) {
        await Swal.fire({
          title: "Usuario actualizado exitosamente!",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#1a1f5e",
          timer: 2000,
          timerProgressBar: true,
        });
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error al editar usuario:", error);
      await Swal.fire({
        title: "No se pudo actualizar el usuario",
        icon: "error",
        text: error.message || "Error en el servidor. Revisa los datos e inténtalo nuevamente.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#1a1f5e",
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  return { handleEditUser };
};

export default useEditUser;