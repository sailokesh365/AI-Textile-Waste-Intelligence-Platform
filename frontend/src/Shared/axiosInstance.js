import axios from "axios";

// Default Production Backend REST API URL
const LIVE_PROD_API_URL = "https://ai-textile-backend.onrender.com/api";
const LIVE_PROD_SERVER_URL = "https://ai-textile-backend.onrender.com";

// Resolve API Base URL with strict production target
const getResolvedApiUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

  // If running in development on localhost
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocalhost && !import.meta.env.PROD) {
      if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return envUrl.replace(/\/+$/, "");
      }
      return "http://localhost:5000/api";
    }
  }

  // If explicit HTTPS API URL provided
  if (envUrl && envUrl.startsWith("https://")) {
    return envUrl.replace(/\/+$/, "");
  }

  // Always use the live production backend API URL in deployed builds
  return LIVE_PROD_API_URL;
};

export const API_BASE_URL = getResolvedApiUrl();

const rawServerUrl = (
  import.meta.env.VITE_SERVER_BASE_URL ||
  (API_BASE_URL.startsWith("/")
    ? ""
    : API_BASE_URL.replace(/\/api\/?$/, ""))
).trim();

export const SERVER_BASE_URL = (() => {
  if (rawServerUrl && rawServerUrl.startsWith("https://")) {
    return rawServerUrl.replace(/\/+$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    !import.meta.env.PROD
  ) {
    return "http://localhost:5000";
  }
  return LIVE_PROD_SERVER_URL;
})();

export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return "/placeholder.png";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${SERVER_BASE_URL}${cleanPath}`;
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

// Add a request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
