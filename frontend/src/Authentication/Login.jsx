import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import FlowingBackground from "./FlowingBackground";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("email"); // "email" | "password"
  
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [socialNotice, setSocialNotice] = useState("");

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("request"); // "request" | "reset"
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validateEmail = (val) => {
    if (!val || !val.trim()) {
      return "Please enter your work email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return "Please enter a valid work email address (e.g., user@domain.com).";
    }
    return "";
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      setEmailError(validateEmail(val));
    }
  };

  const handleContinueEmail = (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSocialNotice("");

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setEmailError("");
    setStep("password");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSocialNotice("");

    const emailErr = validateEmail(email);
    if (emailErr) {
      setEmailError(emailErr);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err) {
      console.error("[Login Error]", err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" && err.response.data.length < 200 ? err.response.data : null);

      if (serverMsg === "Invalid email or password") {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (serverMsg) {
        setError(serverMsg);
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError("Unable to connect to the authentication server. Please verify the network connection or try again shortly.");
      } else if (err.response?.status === 503) {
        setError("Authentication service or database is temporarily unavailable. Please try again in a moment.");
      } else {
        setError(err.message || "Authentication failed. Please verify your credentials and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (forgotSubmitting) return;

    setForgotMessage("");
    setForgotError("");

    const err = validateEmail(forgotEmail);
    if (err) {
      setForgotError(err);
      return;
    }

    try {
      setForgotSubmitting(true);
      const res = await forgotPassword(forgotEmail.trim());
      if (res.resetToken) {
        setResetTokenInput(res.resetToken);
        setForgotStep("reset");
        setForgotMessage(res.message || "Reset token issued. Please set your new password below.");
      } else {
        setForgotMessage(res.message || "Password recovery instructions have been sent to your email.");
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to issue password reset. Please try again.");
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (forgotSubmitting) return;

    setForgotMessage("");
    setForgotError("");

    if (!newPassword || newPassword.length < 8) {
      setForgotError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    try {
      setForgotSubmitting(true);
      const res = await resetPassword(resetTokenInput, newPassword);
      setForgotMessage(res.message || "Password reset successfully! You can now sign in.");
      setEmail(forgotEmail.trim());
      setStep("password");
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStep("request");
        setNewPassword("");
        setConfirmPassword("");
        setResetTokenInput("");
      }, 1800);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password. Please check reset token.");
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleSocialClick = (provider) => {
    setSocialNotice(`${provider} authentication requires single sign-on enterprise configuration. Please sign in with your email and password below.`);
  };

  return (
    <div className="relative min-h-screen h-screen overflow-hidden flex flex-col justify-between items-center px-4 py-4 sm:py-6">
      {/* Animated Flowing Organic Background */}
      <FlowingBackground />

      {/* Top Header Navigation */}
      <div className="w-full max-w-[380px] sm:max-w-[400px] flex items-center justify-between animate-fade-in z-10">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 rounded-lg p-1 transition duration-200 space-x-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to home</span>
        </Link>
      </div>

      {/* Main Authentication Block */}
      <div className="w-full max-w-[380px] sm:max-w-[400px] my-auto py-2 z-10 animate-fade-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 group mb-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/30 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:bg-blue-700 transition duration-200">
              TI
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Sign in to your AI Textile Waste Intelligence Platform
          </p>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50/90 border border-red-200/80 text-red-700 text-xs flex items-start space-x-2 animate-fade-in shadow-2xs">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Social Provider Notice */}
        {socialNotice && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50/90 border border-blue-200/80 text-blue-800 text-xs flex items-start space-x-2 animate-fade-in shadow-2xs">
            <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-relaxed font-medium">{socialNotice}</span>
          </div>
        )}

        {/* 1-Row Equal-Width Social Auth Buttons Grid */}
        <div className="mt-5 grid grid-cols-4 gap-2.5">
          <button
            type="button"
            title="Continue with Google"
            onClick={() => handleSocialClick("Google")}
            className="flex items-center justify-center h-10 px-2 bg-white/95 border border-slate-200/90 hover:border-slate-300 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] rounded-xl transition duration-200 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 group"
            aria-label="Continue with Google"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </button>

          <button
            type="button"
            title="Continue with GitHub"
            onClick={() => handleSocialClick("GitHub")}
            className="flex items-center justify-center h-10 px-2 bg-white/95 border border-slate-200/90 hover:border-slate-300 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] rounded-xl transition duration-200 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 group"
            aria-label="Continue with GitHub"
          >
            <svg className="w-4 h-4 fill-current text-slate-900 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </button>

          <button
            type="button"
            title="Continue with Apple"
            onClick={() => handleSocialClick("Apple")}
            className="flex items-center justify-center h-10 px-2 bg-white/95 border border-slate-200/90 hover:border-slate-300 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] rounded-xl transition duration-200 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 group"
            aria-label="Continue with Apple"
          >
            <svg className="w-4 h-4 fill-current text-slate-900 group-hover:scale-110 transition duration-200" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.127 3.675-.552 9.1 1.51 12.073 1.012 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2.001-.156-3.679 1.116-4.591 1.116zm2.34-2.948c.844-1.026 1.417-2.454 1.261-3.883-1.22.052-2.701.818-3.57 1.844-.78.897-1.455 2.35-1.273 3.754 1.364.104 2.747-.689 3.582-1.715z" />
            </svg>
          </button>

          <button
            type="button"
            title="Continue with Microsoft"
            onClick={() => handleSocialClick("Microsoft")}
            className="flex items-center justify-center h-10 px-2 bg-white/95 border border-slate-200/90 hover:border-slate-300 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] rounded-xl transition duration-200 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 group"
            aria-label="Continue with Microsoft"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition duration-200" viewBox="0 0 23 23">
              <rect x="1" y="1" width="10" height="10" fill="#f25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
              <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/90"></div>
          </div>
          <span className="relative px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-white">
            or continue with
          </span>
        </div>

        {/* Form */}
        {step === "email" ? (
          <form onSubmit={handleContinueEmail} className="space-y-3.5 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (email) setEmailError(validateEmail(email));
                }}
                placeholder="operator@textileintelligence.io"
                required
                disabled={submitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  emailError ? "border-red-400 bg-red-50/10 focus:ring-red-500/25" : "border-slate-300/80 bg-white/95"
                } text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 transition duration-200 shadow-2xs disabled:opacity-60`}
              />
              {emailError && (
                <p className="text-xs text-red-600 mt-1 font-medium animate-fade-in">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition duration-200 text-sm flex items-center justify-center space-x-1.5 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 animate-fade-in">
            {/* Directly Editable & Focusable Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (email) setEmailError(validateEmail(email));
                }}
                placeholder="operator@textileintelligence.io"
                required
                disabled={submitting}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  emailError ? "border-red-400 bg-red-50/10 focus:ring-red-500/25" : "border-slate-300/80 bg-white/95"
                } text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 transition duration-200 shadow-2xs disabled:opacity-60`}
              />
              {emailError && (
                <p className="text-xs text-red-600 mt-1 font-medium animate-fade-in">{emailError}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotMessage("");
                    setForgotError("");
                    setIsForgotModalOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:underline transition duration-200 cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={submitting}
                  autoFocus
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300/80 bg-white/95 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 transition duration-200 shadow-2xs disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.49 19.49 0 014.28-5.36M9.88 9.88a3 3 0 104.24 4.24m-1.24-7.24A9.97 9.97 0 0112 5c7 0 10 7 10 7a19.49 19.49 0 01-3.14 4.23m-4.74-4.74L3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center space-x-2 cursor-pointer mt-1"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* Navigation Link to Register */}
        <div className="mt-5 text-center text-xs sm:text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-slate-900 font-semibold hover:text-blue-600 focus:outline-none focus:underline transition duration-200"
          >
            Create account
          </Link>
        </div>
      </div>

      {/* Footer copyright note */}
      <div className="w-full max-w-[380px] sm:max-w-[400px] text-center text-[11px] text-slate-400 font-normal animate-fade-in z-10 pb-1">
        © {new Date().getFullYear()} AI Textile Waste Intelligence Platform. All rights reserved.
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-3.5 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {forgotStep === "request" ? "Reset Password" : "Set New Password"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotStep("request");
                }}
                className="text-slate-400 hover:text-slate-600 text-base font-bold p-1 rounded-lg hover:bg-slate-100 transition duration-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {forgotStep === "request"
                ? "Enter your work email address below to receive password recovery instructions."
                : "Enter your new password below to securely update your account credentials."}
            </p>

            {forgotMessage && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-medium animate-fade-in">
                {forgotMessage}
              </div>
            )}

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-fade-in">
                {forgotError}
              </div>
            )}

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="operator@textileintelligence.io"
                    required
                    disabled={forgotSubmitting}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-900 text-xs outline-none transition duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition duration-200 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition duration-200 flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Request Reset Token</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={resetTokenInput}
                    onChange={(e) => setResetTokenInput(e.target.value)}
                    placeholder="Paste reset token if needed"
                    required
                    disabled={forgotSubmitting}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-900 text-xs outline-none transition duration-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    New Password (min 8 characters)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    disabled={forgotSubmitting}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-900 text-xs outline-none transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    disabled={forgotSubmitting}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-900 text-xs outline-none transition duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep("request")}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition duration-200 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition duration-200 flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

