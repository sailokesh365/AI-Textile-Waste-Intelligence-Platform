import axios from "axios";

const rawApiUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").trim();
export const API_BASE_URL =
  rawApiUrl.startsWith("http://") || rawApiUrl.startsWith("https://") || rawApiUrl.startsWith("/")
    ? rawApiUrl
    : `https://${rawApiUrl}${rawApiUrl.endsWith("/api") ? "" : "/api"}`;

const rawServerUrl = (
  import.meta.env.VITE_SERVER_BASE_URL ||
  (API_BASE_URL.startsWith("/")
    ? ""
    : API_BASE_URL.replace(/\/api\/?$/, ""))
).trim();

export const SERVER_BASE_URL =
  rawServerUrl.startsWith("http://") || rawServerUrl.startsWith("https://") || rawServerUrl === ""
    ? rawServerUrl
    : `https://${rawServerUrl}`;

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
  (error) => {
    return Promise.reject(error);
  }
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
