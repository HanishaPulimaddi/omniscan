import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Invalid username or password");
        return;
      }

      // ✅ Store JWT token
      localStorage.setItem("token", data.access_token);

      // ✅ Redirect to ANALYZE page (correct flow)
      navigate("/analyze");
    } catch (err) {
      console.error(err);
      setError("Server unreachable. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="title">OmniScan Login</h2>

        <label className="label">Username</label>
        <input
          className="input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="register-text">
          New user?{" "}
          <span
            className="register-link"
            onClick={() => navigate("/register")}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}
