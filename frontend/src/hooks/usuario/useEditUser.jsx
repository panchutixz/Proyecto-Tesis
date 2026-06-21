import Swal from "sweetalert2";
import { editUser } from "@services/usuarios.service.js";


async function editUserPopup(user) {
  const { value: formValues } = await Swal.fire({
    title: "Editar Usuario",
    html: `
      <div>
        <label for="swal2-nombre">Nombre</label>
        <input id="swal2-nombre" class="swal2-input" value="${user.nombre || ""}" placeholder="Nombre del usuario">
      </div>
      <div>
        <label for="swal2-apellido">Apellido</label>
        <input id="swal2-apellido" class="swal2-input" value="${user.apellido || ""}" placeholder="Apellido del usuario">
      </div>
      <div>
        <label for="swal2-email">Email</label>
        <input id="swal2-email" class="swal2-input" value="${user.email || ""}" placeholder="Email del usuario">
      </div>
      <div>
        <label for="swal2-rol">Rol</label>
        <select id="swal2-rol" class="swal2-input swal2-select">
          <option value="" disabled>Seleccione el rol</option>
          <option value="Empleado" ${user.rol === "Empleado" ? "selected" : ""}>Empleado</option>
          <option value="Encargado" ${user.rol === "Encargado" ? "selected" : ""}>Encargado</option>
          <option value="Supervisor" ${user.rol === "Supervisor" ? "selected" : ""}>Supervisor</option>
          <option value="Bodeguero" ${user.rol === "Bodeguero" ? "selected" : ""}>Bodeguero</option>
        </select>
      </div>
      <div>
        <label for="swal2-telefono">Teléfono</label>
        <input id="swal2-telefono" class="swal2-input" value="${user.telefono || ""}" placeholder="Teléfono del usuario">
      </div>
      <div>
        <label for="swal2-jornada">Jornada</label>
        <select id="swal2-jornada" class="swal2-input swal2-select">
          <option value="" disabled>Seleccione la jornada</option>
          <option value="Mañana" ${user.jornada === "Mañana" ? "selected" : ""}>Mañana</option>
          <option value="Tarde" ${user.jornada === "Tarde" ? "selected" : ""}>Tarde</option>
          <option value="Administrativa" ${user.jornada === "Administrativa" ? "selected" : ""}>Administrativa</option>
        </select>
      </div>
      <div>
        <label for ="swal2-estado">Estado</label>
        <select id="swal2-estado" class="swal2-input swal2-select">
          <option value="" disabled>Seleccione el estado</option>
          <option value="Activo" ${user.estado === "Activo" ? "selected" : ""}>Activo</option>
          <option value="Licencia" ${user.estado === "Licencia" ? "selected" : ""}>Licencia</option>
          <option value="Inactivo" ${user.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
        </select>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar cambios",
    didOpen: () => {
      const popup = Swal.getPopup();
      const style = document.createElement("style");
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
      `;
      popup.appendChild(style);
    },
    preConfirm: () => {
      const nombre = document.getElementById("swal2-nombre").value.trim();
      const apellido = document.getElementById("swal2-apellido").value.trim();
      const email = document.getElementById("swal2-email").value.trim();
      const rol = document.getElementById("swal2-rol").value;
      const telefono = document.getElementById("swal2-telefono").value.trim();
      const jornada = document.getElementById("swal2-jornada").value;
      const estado = document.getElementById("swal2-estado").value;
      const currentUser = JSON.parse(sessionStorage.getItem("usuario"));
      const isSelfEdit = currentUser && currentUser.id === user.id;
      const isRestrictedSelf = isSelfEdit && ["Administrador", "Supervisor", "Encargado"].includes(currentUser?.rol);

      if (!nombre || !apellido || !email || !rol || !telefono || !jornada || !estado) {
        Swal.showValidationMessage("Por favor, complete todos los campos obligatorios");
        return false;
      }

      if (isRestrictedSelf && jornada !== "Administrativa") {
        Swal.showValidationMessage("No puedes cambiar tu jornada laboral. Debe permanecer como Administrativa.");
        return false;
      }

      if (isRestrictedSelf && estado === "Inactivo") {
        Swal.showValidationMessage("No puedes cambiar tu estado a Inactivo.");
        return false;
      }

      return { nombre, apellido, email, rol, telefono, jornada, estado};
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
        timer: 2000,
        timerProgressBar: true,
      });
    }
  };

  return { handleEditUser };
};

export default useEditUser;
