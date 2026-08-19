const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    console.log("Retrying database connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;