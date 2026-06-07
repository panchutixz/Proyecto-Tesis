import Swal from "sweetalert2"
import { CreateUsers } from "@services/usuarios.service.js";

async function addUserPopup(){
    const {value: formValues } = await Swal.fire({
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
            <option value="Empleado" ${user.rol === "Empleado" ? "selected" : ""}>Empleado</option>
          </select>
        </div>
        <div>
          <label for="swal2-telefono">Teléfono</label>
          <input id="swal2-telefono" class="swal2-input" placeholder="Teléfono del usuario">
        </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Añadir",
    didOpen: () => {
      // ajustar visual del select para que coincida con los inputs de SweetAlert2
      const popup = Swal.getPopup();
      const style = document.createElement('style');
      style.innerHTML = `
        /* Force select to match swal2-input appearance */
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
        /* keep labels aligned with inputs */
        .swal2-html-container > div { display:block; margin-bottom:12px; }
        .swal2-html-container label { display:block; margin-bottom:6px; font-weight:500; color:#333; }
      `;
      popup.appendChild(style);
    },
    preConfirm: () => {
        const rut = document.getElementById("swal2-rut").value.trim();
        const nombre = document.getElementById("swal2-nombre").value.trim();
        const apellido = document.getElementById("swal2-apellido").value.trim();
        const email = document.getElementById("swal2-email").value.trim();
        const password = document.getElementById("swal2-password").value;
        const rol = document.getElementById("swal2-rol").value;
        const telefono = document.getElementById("swal2-telefono").value.trim();

        if(!rut || !nombre || !apellido || !email || !rol || !password ){
            Swal.showValidationMessage("Por favor, complete todos los campos obligatorios");
            return false;
        }

        return {rut, nombre, apellido, email, password, rol, telefono};
    }, 
    });
    if(formValues){
        return{
            rut: formValues.rut,
            nombre: formValues.nombre,
            apellido: formValues.apellido,
            email: formValues.email,
            password: formValues.password,
            rol: formValues.rol,
            telefono: formValues.telefono
        };
    }

    return null; //si se cancela
} 

// export con nombre singular y default para coincidir con tu import en Usuarios.jsx
export const useCreateUser = (fetchUsers) => {
    const handleCreateUser = async () => {
        try{
            const formValues = await addUserPopup();
            if(!formValues) return;

            // la llamada lanzará si el backend respondió con error
            const response = await CreateUsers(formValues);
            if(response) {
                await Swal.fire({
                    title: "Usuario añadido exitosamente!",
                    icon: "success",
                    confirmButtonText: "Aceptar",
                    timer: 2000,
                    timerProgressBar: true
                })
                await fetchUsers();
            }

        }catch(error){
            console.error ("Error al añadir al usuario:", error);
            // mostrar al usuario el mensaje enviado por el backend (o uno genérico)
            await Swal.fire({
                title: "No se pudo crear el usuario",
                icon: "error",
                text: error.message || "Error en el servidor. Revisa los datos e inténtalo nuevamente.",
                confirmButtonText: "Aceptar",
                timer: 2000,
                timerProgressBar: true
            });
        } 
    };   
    return { handleCreateUser };
};

export default useCreateUser;