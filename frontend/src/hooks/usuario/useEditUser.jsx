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
          <option value="Estudiante" ${user.rol === "Estudiante" ? "selected" : ""}>Estudiante</option>
          <option value="Funcionario" ${user.rol === "Funcionario" ? "selected" : ""}>Funcionario</option>
          <option value="Académico" ${user.rol === "Académico" ? "selected" : ""}>Académico</option>
          <option value="Guardia" ${user.rol === "Guardia" ? "selected" : ""}>Guardia</option>
        </select>
      </div>
      <div>
        <label for="swal2-telefono">Teléfono</label>
        <input id="swal2-telefono" class="swal2-input" value="${user.telefono || ""}" placeholder="Teléfono del usuario">
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

      if (!nombre || !apellido || !email || !rol || !telefono) {
        Swal.showValidationMessage("Por favor, complete todos los campos obligatorios");
        return false;
      }

      return { nombre, apellido, email, rol, telefono};
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
