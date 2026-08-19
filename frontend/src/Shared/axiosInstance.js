import axios from "axios";

// Normalize API Base URL with robust production fallback
const getResolvedApiUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envUrl) {
    let url = envUrl;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, "");
  }

  // Runtime fallback when deployed to production domain without build-time VITE_API_BASE_URL
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "https://ai-textile-backend.onrender.com/api";
    }
  }

  return "http://localhost:5000/api";
};

export const API_BASE_URL = getResolvedApiUrl();

const rawServerUrl = (
  import.meta.env.VITE_SERVER_BASE_URL ||
  (API_BASE_URL.startsWith("/")
    ? ""
    : API_BASE_URL.replace(/\/api\/?$/, ""))
).trim();

export const SERVER_BASE_URL = (() => {
  let url = rawServerUrl;
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, "");
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
