import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import { API_BASE } from "../services/apiClient";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
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
        setError(typeof data.detail === "string" ? data.detail : "Invalid username or password");
        return;
      }

      // ✅ Store JWT token
      localStorage.setItem("token", data.access_token);

      // ✅ Redirect to ANALYZE page (correct flow)
      navigate("/analyze");
    } catch (err) {
      console.error(err);
      setError("Server unreachable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1>Welcome back</h1>
      <p className="lead">Log in to analyze chest X-rays and review your reports.</p>

      <form onSubmit={handleLogin}>
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
            autoComplete="current-password"
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

        <button className="btn btn-dark btn-lg btn-block" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <>Log in <ArrowRight size={17} /></>}
        </button>
      </form>

      <p className="auth-switch">
        New to OmniScan? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
