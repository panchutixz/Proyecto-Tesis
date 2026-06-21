import { useEffect, useState } from "react";
import { useGetProfile } from "@hooks/profile/useGetProfile.jsx";
import ProfileCard from "@components/ProfileCard.jsx";
import "@styles/profile.css";

const Profile = () => {
  const { fetchProfile } = useGetProfile();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const profileData = await fetchProfile();
        setProfileData(profileData?.data?.userData || null);
      } catch (error) {
        console.error("Error obteniendo el perfil:", error);
        setProfileData(null);
      }
    };
    getProfileData();
  }, []);

  return (
    <div>
      {profileData ? (
        <div className="profile-container">
          <ProfileCard
            user={profileData}
            setUser={setProfileData}
            fetchProfile={fetchProfile}
          />
        </div>
      ) : (
        <p>Cargando perfil...</p>
      )}
    </div>
  );
};

export default Profile;
