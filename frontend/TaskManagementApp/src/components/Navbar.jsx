import { useNavigate } from "react-router-dom";
import api from "../api";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout/", {});
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (onLogout) onLogout();
      navigate("/login", { replace: true });
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <div className="brand-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <span className="brand-title">
          Task<span>Flow</span>
        </span>
      </div>

      <div className="nav-user">
        {user && (
          <div className="user-pill" title={`Logged in as ${user.username}`}>
            <div className="user-avatar" aria-label="User avatar">
              {getInitials(user.username)}
            </div>
            <span className="user-name">{user.username}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          title="Log out of your account"
          aria-label="Logout"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
