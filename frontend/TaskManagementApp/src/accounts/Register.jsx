import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/register/", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Automatically logged in! Go straight to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please check your details."
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7.5" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <h1>Create an Account</h1>
          <p>Start tracking and managing your tasks effortlessly</p>
        </div>

        {error && <div className="alert-banner alert-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Pick a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Create a strong password"
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
            {loading ? "Creating Account..." : "Sign Up & Get Started"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;