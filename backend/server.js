const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const analysisRoutes = require("./routes/analysisRoutes");

// Load environment variables from backend/.env or root
dotenv.config({ path: path.join(__dirname, ".env") });

// Ensure uploads directory exists on server startup
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect Database
connectDB();

const app = express();

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin === "*" ? true : corsOrigin, credentials: true }));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve Static Uploaded Images
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/analyze", require("./routes/analyzeRoutes"));
app.use("/api/materials", require("./routes/materialsRoutes"));
app.use("/api/classification", require("./routes/classificationRoutes"));
app.use("/api/predict", require("./routes/predictRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/sustainability", require("./sustainability/routes/sustainabilityRoutes"));
app.use("/api/recommendation", require("./recommendation/routes/recommendationRoutes"));



// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Backend is running smoothly" });
});

// Default Route
app.get("/", (req, res) => {
  res.send("AI Textile Waste Intelligence Platform Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});