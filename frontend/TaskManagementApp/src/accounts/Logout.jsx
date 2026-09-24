import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

function Logout() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const handleLogout = async () => {
        try {
            await api.post("/logout/", {});

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setMessage("Logged out successfully. Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setMessage(error.response?.data?.message || "Logout failed.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px" }}>
            <h2>Account Dashboard</h2>
            {user ? (
                <p>Welcome, <strong>{user.username}</strong> ({user.email})</p>
            ) : (
                <p>You are on the logout / session page.</p>
            )}
            {message && <p>{message}</p>}
            <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
                Logout
            </button>
            <p style={{ marginTop: "16px" }}>
                <Link to="/login">Back to Login</Link>
            </p>
        </div>
    );
}

export default Logout;