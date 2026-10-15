import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { API_BASE } from "../services/apiClient";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Registration failed. Please check your details.");
        return;
      }

      setMessage("Account created. Taking you to log in…");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1>Create your account</h1>
      <p className="lead">Start screening chest X-rays with structured, AI-assisted reports.</p>

      <form onSubmit={handleRegister}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              className="input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              className="input"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            className="input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
        )}
        {message && (
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={17} />
            {message}
          </div>
        )}

        <button className="btn btn-dark btn-lg btn-block" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <>Create account <ArrowRight size={17} /></>}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
