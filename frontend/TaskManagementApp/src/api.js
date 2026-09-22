import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
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

export default api;
