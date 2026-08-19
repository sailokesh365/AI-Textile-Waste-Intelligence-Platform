const mongoose = require("mongoose");

const connectDB = async () => {
  const rawUri = (process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db").trim();
  
  // Mask password for safe logging
  const maskedUri = rawUri.replace(/:([^@/]+)@/, ":*****@");
  console.log(`[DB] Connecting to MongoDB: ${maskedUri}`);

  try {
    const conn = await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[DB] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("[DB Error] MongoDB Connection Failed:", error.message);
    console.log("[DB] Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;