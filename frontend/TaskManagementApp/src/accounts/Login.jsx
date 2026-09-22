import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, automatically go to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login/", {
        username: username.trim(),
        password,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card animate-fade">
        <div className="auth-header">
          <div className="brand-icon" style={{ margin: "0 auto", width: "48px", height: "48px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to access and manage your tasks</p>
        </div>

        {error && <div className="alert-banner alert-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "6px" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;