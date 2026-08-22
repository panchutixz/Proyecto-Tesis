import "@styles/profile.css";
import axios from "@services/root.service.js";
import { useUpdateProfile } from "@hooks/profile/updateProfile.jsx";
import Swal from "sweetalert2";
import { useState } from "react";
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";

// Genera las iniciales (ej: "Juan Pérez González" -> "JP") para el avatar
// que se muestra cuando el usuario no tiene una foto de perfil subida.
const getIniciales = (nombre = "", apellido = "") => {
  const n = nombre.trim().charAt(0) || "";
  const a = apellido.trim().charAt(0) || "";
  return `${n}${a}`.toUpperCase() || "?";
};

const ProfileCard = ({ user, setUser, fetchProfile }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const getImageUrl = (path) => `${BASE_URL.replace("/api", "")}${path}`;

  const { updateUserProfile } = useUpdateProfile();

  const [profileImage, setProfileImage] = useState(
    user.foto_perfil ? getImageUrl(user.foto_perfil) : null
  );

  // ── Estado del formulario editable ──
  const nombreCompletoInicial = `${user.nombre || ""} ${user.apellido || ""}`.trim();
  const [nombreCompleto, setNombreCompleto] = useState(nombreCompletoInicial);
  const [email, setEmail]                   = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [saving, setSaving]                   = useState(false);

  const resetForm = () => {
    setNombreCompleto(nombreCompletoInicial);
    setEmail(user.email || "");
    setCurrentPassword("");
    setNewPassword("");
  };

  // ── Subida de foto de perfil ──
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
        setUser({ ...user, foto_perfil: nuevaRuta });
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

    const handleGuardarCambios = async () => {
    // Mismas reglas de contraseña que usa el registro: 8-26 caracteres, solo letras y números
    if (newPassword) {
      const passwordRegex = /^[a-zA-Z0-9]+$/;

      if (newPassword.length < 8) {
        Swal.fire({
          title: "Contraseña muy corta",
          text: "La nueva contraseña debe tener al menos 8 caracteres.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
        return;
      }
      if (newPassword.length > 26) {
        Swal.fire({
          title: "Contraseña muy larga",
          text: "La nueva contraseña no puede exceder los 26 caracteres.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
        return;
      }
      if (!passwordRegex.test(newPassword)) {
        Swal.fire({
          title: "Contraseña inválida",
          text: "La contraseña solo puede contener letras y números. No se permiten símbolos especiales.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
        return;
      }
      if (!currentPassword) {
        Swal.fire({
          title: "Falta tu contraseña actual",
          text: "Debes ingresar tu contraseña actual para definir una nueva.",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
        return;
      }
    }

    // "Nombre completo" -> primera palabra = nombre, el resto = apellido
    const partes   = nombreCompleto.trim().split(/\s+/);
    const nombre   = partes.shift() || "";
    const apellido = partes.join(" ");

    const payload = { nombre, apellido, email };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword     = newPassword;
    }

    setSaving(true);
    try {
      const response = await updateUserProfile(payload);

      if (response.status !== "Success") {
        throw new Error(response.message || "No se pudo actualizar el perfil.");
      }

      setUser({ ...user, ...response.data });
      setCurrentPassword("");
      setNewPassword("");

      await Swal.fire({
        title: "Perfil actualizado",
        icon: "success",
        confirmButtonText: "Aceptar",
        timer: 2000,
        timerProgressBar: true,
      });

      if (fetchProfile) await fetchProfile();
    } catch (err) {
      Swal.fire({
        title: "No se pudo guardar",
        text: err.message || "Ocurrió un error al actualizar tu perfil.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setSaving(false);
    }
  };

  const iniciales = getIniciales(user.nombre, user.apellido);

  return (
    <div className="profile-card">

      {/* ── Banner superior ── */}
      <div className="profile-banner">
        <div className="profile-banner-dark" />
        <div className="profile-banner-light" />
      </div>

      {/* ── Encabezado: avatar + nombre + botón cambiar foto ── */}
      <div className="profile-head">
                <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {profileImage ? (
              <img src={profileImage} alt={`${user.nombre}`} />
            ) : (
              <span>{iniciales}</span>
            )}
          </div>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div className="profile-head-info">
          <h2>{user.nombre} {user.apellido}</h2>
          <span className="profile-role-pill">{user.rol || "Sin rol"}</span>
        </div>

        <button
          type="button"
          className="profile-btn-cambiar-foto"
          onClick={() => document.getElementById("fileInput").click()}
        >
          Cambiar foto
        </button>
      </div>

      {/* ── Formulario de datos ── */}
      <div className="profile-form">
        <div className="profile-form-grid">

          <div className="profile-field">
            <label><FaUser /> Nombre completo</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label><FaIdCard /> RUT</label>
            <input type="text" value={user.rut || ""} disabled />
          </div>

          <div className="profile-field">
            <label><FaEnvelope /> Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label><FaShieldAlt /> Rol en sistema</label>
            <input type="text" value={user.rol || ""} disabled />
          </div>
        </div>

        {/* ── Seguridad ── */}
        <div className="profile-seguridad">
          <h3><FaLock /> Seguridad</h3>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label>Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="profile-field">
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
              <small className="profile-field-hint">Mínimo 8 caracteres, solo letras y números.
              </small>
            </div>
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className="profile-actions">
          <button type="button" className="profile-btn-cancelar" onClick={resetForm} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="profile-btn-guardar" onClick={handleGuardarCambios} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;