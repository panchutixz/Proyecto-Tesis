import { updateProfile } from "@services/profile.service";

export const useUpdateProfile = () => {
  const updateUserProfile = async (userData) => {
    try {
      // updateProfile() ya devuelve el body completo del backend: { status, message, data }
      const response = await updateProfile(userData);
      return response;
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      throw error;
    }
  };

  return { updateUserProfile };
};