import "@styles/profile.css";
import axios from "@services/root.service.js";
import Swal from "sweetalert2";
import { useState } from "react";

import administradorPic from "@assets/roles/administrador.jpg";
import empleadoPic from "@assets/roles/empleado.jpg";
import supervisorPic from "@assets/roles/supervisor.jpg";
import bodegueroPic from "@assets/roles/bodeguero.jpg";
import defaultPic from "@assets/gatodosekai.png";

const roleImages = {
  administrador: administradorPic,
  empleado: empleadoPic,
  supervisor: supervisorPic,
  bodeguero: bodegueroPic,
};

const ProfileCard = ({ user, setUser, fetchProfile }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const getImageUrl = (path) => `${BASE_URL.replace("/api", "")}${path}`;

  const [profileImage, setProfileImage] = useState(
    user.foto_perfil
      ? getImageUrl(user.foto_perfil)
      : roleImages[user.rol?.toLowerCase()] || defaultPic
  );

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imagePreview = reader.result;

      const confirmUpload = await Swal.fire({
        title: "¿Deseas actualizar tu foto de perfil?",
        html: `
          <img src="${imagePreview}" alt="Vista previa" 
               style="max-width:100%; border-radius:8px; margin-top:12px;" />
          <p style="margin-top:10px; font-size:14px; color:#555;">
            Archivo: ${file.name} <br/>
            Tamaño: ${(file.size / 1024).toFixed(2)} KB
          </p>
        `,
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
        focusConfirm: false,
      });

      if (!confirmUpload.isConfirmed) return;

      const formData = new FormData();
      formData.append("profileImage", file);

      try {
        const res = await axios.post("/profile/profile-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await Swal.fire({
          title: "Foto actualizada correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          timer: 2000,
          timerProgressBar: true,
        });

        const nuevaRuta = res.data.data.path;
        const timestamp = Date.now();
        setProfileImage(`${getImageUrl(nuevaRuta)}?t=${timestamp}`);

        // Actualiza el estado del usuario con la nueva ruta
        const updatedUser = { ...user, foto_perfil: nuevaRuta };
        setUser(updatedUser);
      } catch (err) {
        console.error("Error al subir imagen:", err);
        await Swal.fire({
          title: "Error al actualizar la foto",
          icon: "error",
          text: err.message || "No se pudo subir la imagen. Intenta nuevamente.",
          confirmButtonText: "Aceptar",
          timer: 2500,
          timerProgressBar: true,
        });
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-card">
      <h1 className="profile-header"><strong>Perfil de Usuario</strong></h1>
      <div className="profile-content">
        <div className="profile-image">
          <img src={profileImage} alt={`${user.nombre}'s profile`} />
        </div>
        <div className="profile-info">
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Correo:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.rol || "No especificado"}</p>

          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Cambiar foto de perfil
          </button>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
