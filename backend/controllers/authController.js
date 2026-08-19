const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || "TextileWaste@2026",
    { expiresIn: "7d" }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`[Auth] Registration attempt for email: ${email}`);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`[Auth] Registration rejected - user already exists: ${normalizedEmail}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // New users default to "User" role by default
    const userRole = role === "Admin" ? "Admin" : "User";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
    });

    const token = generateToken(user._id, user.role);
    console.log(`[Auth] User registered successfully: ${normalizedEmail} (ID: ${user._id})`);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth Error] Registration error:", error);
    res.status(500).json({ message: error.message || "Registration failed on server" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth] Login attempt for email: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[Auth] Login failed - user not found: ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Auth] Login failed - incorrect password for: ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);
    console.log(`[Auth] User logged in successfully: ${normalizedEmail} (ID: ${user._id})`);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth Error] Login error:", error);
    res.status(500).json({ message: error.message || "Login failed on server" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("[Auth Error] getUserProfile error:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve profile" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("[Auth Error] updateUserProfile error:", error);
    res.status(500).json({ message: error.message || "Failed to update profile" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please provide your email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        message: "If an account exists with that email, password reset instructions have been issued.",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id, type: "password_reset" },
      process.env.JWT_SECRET || "TextileWaste@2026",
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset instructions issued. Use the token to reset your password.",
      resetToken,
    });
  } catch (error) {
    console.error("[Auth Error] forgotPassword error:", error);
    return res.status(500).json({ message: error.message || "Failed to process password reset request" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, email, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }

    let user = null;
    if (resetToken) {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "TextileWaste@2026");
      if (decoded.type !== "password_reset") {
        return res.status(400).json({ message: "Invalid reset token." });
      }
      user = await User.findById(decoded.id);
    } else if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      user = await User.findOne({ email: normalizedEmail });
    }

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("[Auth Error] resetPassword error:", error);
    return res.status(400).json({ message: error.message || "Invalid or expired reset token." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};