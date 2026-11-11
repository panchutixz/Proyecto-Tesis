import {eliminateProfile} from "@services/profile.service";

export const useEliminateProfile = () => {
  const deleteUserProfile = async (userId) => {
    try {
      const response = await eliminateProfile(userId);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar el perfil:", error);
      throw error;
    }
  };

  return { deleteUserProfile };
};
