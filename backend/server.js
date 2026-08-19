const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
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

// Comprehensive CORS Configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve Static Uploaded Images
app.use("/uploads", express.static(uploadsDir));

// Register all modular routers under BOTH /api/* and root /* for universal client compatibility
const routeModules = [
  { path: "/auth", router: authRoutes },
  { path: "/inventory", router: inventoryRoutes },
  { path: "/analysis", router: analysisRoutes },
  { path: "/upload", router: require("./routes/uploadRoutes") },
  { path: "/analyze", router: require("./routes/analyzeRoutes") },
  { path: "/materials", router: require("./routes/materialsRoutes") },
  { path: "/classification", router: require("./routes/classificationRoutes") },
  { path: "/predict", router: require("./routes/predictRoutes") },
  { path: "/history", router: require("./routes/historyRoutes") },
  { path: "/sustainability", router: require("./sustainability/routes/sustainabilityRoutes") },
  { path: "/recommendation", router: require("./recommendation/routes/recommendationRoutes") },
];

routeModules.forEach(({ path: routePath, router }) => {
  app.use(`/api${routePath}`, router);
  app.use(routePath, router);
});

// Universal Health check routes
app.get(["/health", "/api/health"], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    status: "OK",
    message: "AI Textile Waste Platform Backend is running",
    database: dbStatusMap[dbState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Default Root Route
app.get("/", (req, res) => {
  res.send("AI Textile Waste Intelligence Platform Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});