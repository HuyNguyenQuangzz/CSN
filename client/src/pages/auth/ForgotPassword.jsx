import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await "http://localhost:5000".post("/auth/forgot-password", { email });
    alert("Check your email for reset link!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Send Reset Link</button>
    </form>
  );
}
