import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";  // Reuse same styling as login

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Registration failed");
        return;
      }

      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Server unreachable");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="title">Create Account</h2>

        <label className="label">Full Name</label>
        <input
          className="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label">Phone</label>
        <input
          className="input"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label className="label">Username</label>
        <input
          className="input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button className="login-btn" onClick={handleRegister}>
          Register
        </button>

        <p className="register-text">
          Already have an account?{" "}
          <span className="register-link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
