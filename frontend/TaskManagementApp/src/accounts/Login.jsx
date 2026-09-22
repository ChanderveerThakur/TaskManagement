import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        {
          username,
          password
        },
        {
          withCredentials: true
        }
      );

      if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      setSuccess("Login successful!");
      setTimeout(() => {
        navigate("/logout");
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleLogin}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <button type="submit">
          Login
        </button>

      </form>

      <p>
        Don't have an account?{" "}
        <Link to="/register">
          Register
        </Link>
      </p>

    </div>
  );
};

export default Login;