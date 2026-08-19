const mongoose = require("mongoose");

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) {
    return;
  }

  const rawUri = (process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db").trim();
  
  // Mask password for safe logging
  const maskedUri = rawUri.replace(/:([^@/]+)@/, ":*****@");
  console.log(`[DB] Connecting to MongoDB: ${maskedUri}`);

  isConnecting = true;
  try {
    const conn = await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isConnecting = false;
    console.log(`[DB] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnecting = false;
    console.error("[DB Error] MongoDB Connection Failed:", error.message);
    console.log("[DB] Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("[DB Warning] MongoDB connection lost. Attempting reconnect...");
  setTimeout(connectDB, 5000);
});

module.exports = connectDB;