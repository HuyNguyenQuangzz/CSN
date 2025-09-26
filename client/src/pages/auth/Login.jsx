import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        ...form,
        recaptchaToken,
      });
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      alert("Login success: " + res.data.msg);
      localStorage.setItem("accessToken", res.data.accessToken);
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email address" onChange={handleChange} />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <ReCAPTCHA
        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        onChange={(token) => setRecaptchaToken(token)}
      />

      <button type="submit">Sign in</button>
    </form>
  );
}
