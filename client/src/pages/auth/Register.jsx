import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/auth/register", form);
    alert("Please check your email to verify your account!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="firstName"
        placeholder="First name"
        onChange={handleChange}
      />
      <input name="lastName" placeholder="Last name" onChange={handleChange} />
      <input name="age" placeholder="Your age" onChange={handleChange} />
      <input name="email" placeholder="Email address" onChange={handleChange} />
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Sign up</button>
    </form>
  );
}
