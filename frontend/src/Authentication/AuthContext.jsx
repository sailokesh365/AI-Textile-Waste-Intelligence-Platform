import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../Shared/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get("/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Token invalid or expired:", error);
        localStorage.clear();
        sessionStorage.clear();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    // Purge any residual client cache before establishing new user session
    localStorage.clear();
    sessionStorage.clear();

    const response = await axiosInstance.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password, role = "User") => {
    localStorage.clear();
    sessionStorage.clear();

    const response = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const response = await axiosInstance.put("/auth/profile", profileData);
    setUser(response.data);
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", { email });
    return response.data;
  };

  const resetPassword = async (resetToken, newPassword) => {
    const response = await axiosInstance.post("/auth/reset-password", { resetToken, newPassword });
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
