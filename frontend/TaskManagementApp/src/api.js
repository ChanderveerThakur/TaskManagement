import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "";
const resolveBaseURL = () => {
  let url = (rawBaseURL || "").trim();
  if (!url) return "http://127.0.0.1:8000/api";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  if (!url.endsWith("/api") && !url.endsWith("/api/")) {
    url = url.replace(/\/+$/, "") + "/api";
  }
  return url;
};

const baseURL = resolveBaseURL();
console.log("[TaskManagement] Using API baseURL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Automatically attach Token to all outgoing requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear and redirect if it's 401 and not an intentional login attempt
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/login/") &&
      !error.config?.url?.includes("/register/")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { baseURL };
export default api;
