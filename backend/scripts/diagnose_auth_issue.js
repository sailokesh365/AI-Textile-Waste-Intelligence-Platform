const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Inventory = require("../models/Inventory");
const Analysis = require("../models/Analysis");
const UploadedImage = require("../models/UploadedImage");

async function diagnoseAuth() {
  console.log("==========================================");
  console.log("AUTHENTICATION RECOVERY DIAGNOSTIC SUITE");
  console.log("==========================================");

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  console.log(`1. MongoDB Connection URI: ${mongoUri}`);

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`   Connected Host: ${conn.connection.host}`);
    console.log(`   Connected DB Name: ${conn.connection.name}`);

    // Check user existence
    const targetEmail = "sailokesh365@gmail.com";
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.log(`\n2. User record for ${targetEmail}: NOT FOUND!`);
    } else {
      console.log(`\n2. User record for ${targetEmail}: FOUND`);
      console.log("3. Safe Metadata:");
      console.log(`   - userId: ${user._id}`);
      console.log(`   - email: ${user.email}`);
      console.log(`   - role: ${user.role}`);
      console.log(`   - createdAt: ${user.createdAt}`);
      console.log(`   - name: ${user.name}`);
      console.log(`   - password field exists: ${Boolean(user.password)}`);
      console.log(`   - password field type: ${typeof user.password}`);
      console.log(`   - password field length: ${user.password ? user.password.length : 0}`);

      // Check hash format without printing hash
      const isBcryptHash = Boolean(user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")));
      console.log(`4. Hash Validity & Compatibility:`);
      console.log(`   - Valid Bcrypt prefix ($2a$/$2b$): ${isBcryptHash}`);

      // Let's test bcrypt comparison against common/expected pattern or check if bcrypt.compare works without erroring
      try {
        const dummyMatch = await bcrypt.compare("dummy_test_password_123!", user.password);
        console.log(`   - bcrypt.compare execution test: PASSED (Returned: ${dummyMatch})`);
      } catch (bcryptErr) {
        console.log(`   - bcrypt.compare execution test: FAILED WITH ERROR: ${bcryptErr.message}`);
      }

      // Check linked data
      const invCount = await Inventory.countDocuments({ createdBy: user._id });
      const imgCount = await UploadedImage.countDocuments({ createdBy: user._id });
      const analysisCount = await Analysis.countDocuments({ createdBy: user._id });

      console.log(`\nUser Linked Data Audit:`);
      console.log(`   - Inventory Items: ${invCount}`);
      console.log(`   - Uploaded Images: ${imgCount}`);
      console.log(`   - Analysis Records: ${analysisCount}`);
    }

    // Check if other users exist or if db contains other records
    const totalUsers = await User.countDocuments({});
    console.log(`\nTotal Users in DB '${conn.connection.name}': ${totalUsers}`);

    // Check env vars
    console.log("\n7. Environment Variables Check:");
    console.log(`   - PORT: ${process.env.PORT}`);
    console.log(`   - MONGO_URI: ${process.env.MONGO_URI}`);
    console.log(`   - JWT_SECRET configured: ${Boolean(process.env.JWT_SECRET)}`);
    console.log(`   - JWT_SECRET length: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0}`);

  } catch (err) {
    console.error("Diagnostic Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

diagnoseAuth();
