import { updateProfile } from "@services/profile.service";

export const useUpdateProfile = () => {
  const updateUserProfile = async (userData) => {
    try {
      const response = await updateProfile(userData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      throw error;
    }
  };

  return { updateUserProfile };
};