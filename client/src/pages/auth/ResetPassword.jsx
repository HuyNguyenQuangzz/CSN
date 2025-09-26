import { useState } from "react";
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await "http://localhost:5000".post("/auth/reset-password", {
      token,
      password,
    });
    alert("Password reset successfully!");
    window.location.href = "/login";
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
      />
      <button type="submit">Reset</button>
    </form>
  );
}
