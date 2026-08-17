import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";
import { useNotifications } from "./NotificationContext";

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSec = Math.floor((now - past) / 1000);

  if (diffInSec < 60) return "Just now";
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  return past.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `whitespace-nowrap text-xs xl:text-[13px] font-medium tracking-tight px-2 lg:px-3 py-1.5 transition-colors duration-200 ${
      isActive
        ? "text-blue-400 font-semibold"
        : "text-slate-300 hover:text-white"
    }`;
  };

  const mobileNavLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center justify-between text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? "text-blue-400 bg-blue-500/15 border border-blue-500/30"
        : "text-slate-200 hover:bg-white/10 hover:text-white"
    }`;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out pointer-events-none ${
        scrolled ? "px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3" : "px-0 pt-0"
      }`}
    >
      {/* 
        Container with smooth 500ms transition between:
        1. Initial state (scroll position 0): Normal full-width navbar integrated into the page (rounded-none, border-b)
        2. Scrolled state (> 25px): Compact floating capsule, rounded-full, centered, glass blur & shadow
      */}
      <div
        className={`pointer-events-auto mx-auto transition-all duration-500 ease-in-out ${
          scrolled
            ? isAuthenticated
              ? "max-w-5xl w-full bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-full shadow-2xl shadow-black/40 px-5 sm:px-7 py-2"
              : "max-w-6xl w-full bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-full shadow-2xl shadow-black/40 px-4 lg:px-6 py-2"
            : "max-w-full w-full bg-slate-900/95 backdrop-blur-xl border-none rounded-none shadow-none px-4 sm:px-8 lg:px-12 py-3.5"
        }`}
      >
        {isAuthenticated ? (
          /* LOGGED-IN NAVBAR: Flex Layout with Natural Spacing (Prevents Column Overlap) */
          <div className="flex items-center justify-between gap-3 h-10 sm:h-11 w-full">
            {/* LEFT SECTION: TI Logo + TextileIntel Branding */}
            <div className="flex items-center justify-start">
              <Link
                to="/"
                className="flex items-center gap-2 group focus:outline-hidden shrink-0 whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xs tracking-wider shadow-sm transition-transform duration-300 group-hover:scale-105">
                  TI
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  Textile<span className="text-blue-400">Intel</span>
                </span>
              </Link>
            </div>

            {/* CENTER SECTION: 5 Navigation Items (Mathematically Centered) */}
            <div className="hidden md:flex items-center justify-center">
              <nav className="flex items-center space-x-0.5 lg:space-x-1.5 xl:space-x-2 shrink-0 whitespace-nowrap">
                <Link to="/" className={navLinkClass("/")}>
                  Home
                </Link>
                <Link to="/analysis" className={navLinkClass("/analysis")}>
                  Image Analysis
                </Link>
                <Link to="/inventory" className={navLinkClass("/inventory")}>
                  Inventory Portal
                </Link>
                <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                  Analytics Dashboard
                </Link>
                <Link to="/history" className={navLinkClass("/history")}>
                  History
                </Link>
              </nav>
            </div>

            {/* RIGHT SECTION: Notification Bell & Profile Dropdown Button */}
            <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
              {/* Notification Bell Button & Dropdown Container */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-hidden cursor-pointer"
                  aria-label="View notifications"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500 text-white ring-2 ring-slate-900 min-w-[18px] text-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 text-slate-900 overflow-hidden animate-slide-down">
                    {/* Header */}
                    <div className="px-4 py-3.5 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Content List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center px-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-slate-900">You're all caught up.</p>
                          <p className="text-xs text-slate-500 mt-0.5">No new notifications right now.</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) navigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                              !n.read ? "bg-blue-50/50 hover:bg-blue-100/40" : "bg-white hover:bg-slate-50"
                            }`}
                          >
                            {/* Type Icon */}
                            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold mt-0.5 ${
                              n.type === "analysis"
                                ? "bg-blue-100 text-blue-600"
                                : n.type === "inventory"
                                ? "bg-emerald-100 text-emerald-600"
                                : n.type === "report"
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-amber-100 text-amber-600"
                            }`}>
                              {n.type === "analysis" ? "✨" : n.type === "inventory" ? "📦" : n.type === "report" ? "📄" : "🔔"}
                            </div>

                            {/* Message text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-xs truncate ${!n.read ? "font-extrabold text-slate-900" : "font-semibold text-slate-800"}`}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                                  {formatRelativeTime(n.timestamp)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                                {n.message}
                              </p>
                            </div>

                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-2.5 border-t border-slate-200/80 bg-slate-50/80 text-center">
                        <button
                          onClick={clearAll}
                          className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        >
                          Clear all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Button + Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 shadow-2xs group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs group-hover:scale-105 transition-transform duration-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="text-xs font-semibold text-slate-100 leading-tight">
                      {user?.name
                        ? user.name.startsWith("Hello")
                          ? user.name
                          : `Hello ${user.name}`
                        : "Hello Admin"}
                    </p>
                    <p className="text-[10px] font-medium text-blue-400 leading-tight capitalize">
                      {user?.role || "Admin"}
                    </p>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl py-2 px-3 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white">
                        {user?.name || "Admin User"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user?.email || "admin@textileintel.com"}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full capitalize">
                        {user?.role || "Admin"}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>My Profile</span>
                    </Link>

                    <div className="border-t border-white/10 my-1"></div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-xl transition-all duration-200 cursor-pointer text-left"
                    >
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-hidden cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* PRE-LOGIN NAVBAR: Original Unchanged Flex Layout */
          <div className="flex items-center justify-between h-10 sm:h-11">
            {/* Left: Brand Logo & Title */}
            <Link
              to="/"
              className="flex items-center gap-2 group focus:outline-hidden shrink-0 whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xs tracking-wider shadow-sm transition-transform duration-300 group-hover:scale-105">
                TI
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Textile<span className="text-blue-400">Intel</span>
              </span>
            </Link>

            {/* Center: Desktop Navigation Bar */}
            <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1.5 xl:space-x-2 shrink-0 whitespace-nowrap">
              <Link to="/" className={navLinkClass("/")}>
                Home
              </Link>
              <Link to="/analysis" className={navLinkClass("/analysis")}>
                Image Analysis
              </Link>
              <Link to="/inventory" className={navLinkClass("/inventory")}>
                Inventory Portal
              </Link>
              <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                Analytics Dashboard
              </Link>
              <Link to="/history" className={navLinkClass("/history")}>
                History
              </Link>
            </nav>

            {/* Right: Auth Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 lg:gap-2 shrink-0 whitespace-nowrap">
                <Link
                  to="/login"
                  className="whitespace-nowrap px-2.5 lg:px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="whitespace-nowrap px-3 lg:px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <svg
                    className="w-3.5 h-3.5 text-blue-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-hidden cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 space-y-1.5 animate-fade-in pb-3 bg-slate-900/95 backdrop-blur-2xl rounded-2xl px-4 border border-white/10 shadow-2xl">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass("/")}
            >
              <span>Home</span>
              {location.pathname === "/" && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              )}
            </Link>
            <Link
              to="/analysis"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass("/analysis")}
            >
              <span>Image Analysis</span>
              {location.pathname === "/analysis" && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              )}
            </Link>
            <Link
              to="/inventory"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass("/inventory")}
            >
              <span>Inventory Portal</span>
              {location.pathname === "/inventory" && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              )}
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass("/dashboard")}
            >
              <span>Analytics Dashboard</span>
              {location.pathname === "/dashboard" && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              )}
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass("/history")}
            >
              <span>History</span>
              {location.pathname === "/history" && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              )}
            </Link>

            <div className="border-t border-white/10 pt-3 mt-3 px-1">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-white/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {user?.name}
                      </p>
                      <p className="text-xs text-blue-400 font-medium capitalize">
                        {user?.role || "User"}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-all duration-200 border border-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-xs transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

