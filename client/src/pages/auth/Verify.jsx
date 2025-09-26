import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Verify() {
  const { token } = useParams();
  const [status, setStatus] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify/${token}`
        );
        setStatus(res.data.msg);
      } catch {
        setStatus("Invalid or expired link");
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div>
      <h1>{status}</h1>
      {status === "Email verified successfully" && (
        <a href="/login">Okay, got it!</a>
      )}
    </div>
  );
}
