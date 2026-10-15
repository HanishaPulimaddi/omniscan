import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Every backend route lives under /api (auth, analyze, history) except
// /uploads (static file mount) and /health — API_BASE stays bare so those
// two can still be built directly off it.
const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
