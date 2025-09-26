import React from "react";
import api from "../../services/axiosInstance";

const Profile = () => {
  const fetchProfile = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await api.get("/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(res.data);
  };

  return (
    <div>
      <button onClick={fetchProfile}>Fetch profile</button>
    </div>
  );
};

export default Profile;
