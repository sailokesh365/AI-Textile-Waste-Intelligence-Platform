import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../Authentication/AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = `notifications_${user?.email || "guest"}`;

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to load notifications from localStorage:", e);
      return [];
    }
  });

  // Reload notifications when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setNotifications(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setNotifications([]);
    }
  }, [user?.email]);

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Failed to save notifications to localStorage:", e);
    }
  }, [notifications, storageKey]);

  const addNotification = ({ title, message, type = "system", link = null }) => {
    const newNotif = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      title,
      message,
      type, // 'analysis' | 'inventory' | 'report' | 'system'
      link,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Listen for global custom events so non-React utility files can also dispatch notifications
  useEffect(() => {
    const handleGlobalNotification = (event) => {
      if (event.detail) {
        addNotification(event.detail);
      }
    };
    window.addEventListener("app-notification", handleGlobalNotification);
    return () => {
      window.removeEventListener("app-notification", handleGlobalNotification);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearAll: () => {},
    };
  }
  return context;
};

// Global helper for non-component files (e.g. utility functions)
export const notify = (title, message, type = "system", link = null) => {
  window.dispatchEvent(
    new CustomEvent("app-notification", {
      detail: { title, message, type, link },
    })
  );
};
