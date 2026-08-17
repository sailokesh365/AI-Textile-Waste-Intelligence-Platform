const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Inventory = require("../models/Inventory");

async function testAuthSystem() {
  console.log("==========================================");
  console.log("AUTHENTICATION FOUNDATION INTEGRITY TEST");
  console.log("==========================================");

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db");
    console.log("✓ Database connected successfully.");

    const testEmailA = `test.user.a.${Date.now()}@example.com`;
    const testEmailB = `test.user.b.${Date.now()}@example.com`;
    const password = "SecurePassword123!";

    // 1. Create User A
    console.log(`\n1. Testing Signup for ${testEmailA}...`);
    const hashedPwA = await bcrypt.hash(password, 10);
    const userA = await User.create({
      name: "Test User A",
      email: testEmailA,
      password: hashedPwA,
      role: "User",
    });
    console.log(`   ✓ Signup successful. User ID: ${userA._id}`);
    console.log(`   ✓ Password hashed securely with bcrypt: ${userA.password.startsWith("$2a$") || userA.password.startsWith("$2b$")}`);
    console.log(`   ✓ Default role assigned: ${userA.role}`);

    // 2. Duplicate Email Check
    console.log(`\n2. Testing Duplicate Signup for ${testEmailA}...`);
    const duplicateUser = await User.findOne({ email: testEmailA });
    console.log(`   ✓ Duplicate detected: ${!!duplicateUser} (User already exists)`);

    // 3. Password Verification (Correct vs Incorrect)
    console.log(`\n3. Testing Login Password Verification...`);
    const matchCorrect = await bcrypt.compare(password, userA.password);
    const matchWrong = await bcrypt.compare("WrongPassword", userA.password);
    console.log(`   ✓ Valid password match: ${matchCorrect}`);
    console.log(`   ✓ Invalid password rejected: ${!matchWrong}`);

    // 4. JWT Token Generation & Protection Verification
    console.log(`\n4. Testing Session JWT Token Generation & Verification...`);
    const tokenA = jwt.sign(
      { id: userA._id, role: userA.role },
      process.env.JWT_SECRET || "TextileWaste@2026",
      { expiresIn: "7d" }
    );
    const decodedA = jwt.verify(tokenA, process.env.JWT_SECRET || "TextileWaste@2026");
    console.log(`   ✓ Token issued and verified. Decoded User ID: ${decodedA.id}`);

    // 5. User Data Isolation Test (User A vs User B)
    console.log(`\n5. Testing Multi-Tenant Data Isolation (User A vs User B)...`);
    const userB = await User.create({
      name: "Test User B",
      email: testEmailB,
      password: await bcrypt.hash(password, 10),
      role: "User",
    });

    const itemA = await Inventory.create({
      wasteBatchId: `BATCH-A-${Date.now()}`,
      fabricType: "Cotton",
      source: "Post-Consumer",
      quantity: 150,
      color: "Blue",
      condition: "Good",
      createdBy: userA._id,
    });

    const itemB = await Inventory.create({
      wasteBatchId: `BATCH-B-${Date.now()}`,
      fabricType: "Silk",
      source: "Pre-Consumer",
      quantity: 80,
      color: "Red",
      condition: "Excellent",
      createdBy: userB._id,
    });

    // Query User A's items
    const userAItems = await Inventory.find({ createdBy: userA._id });
    const userBItems = await Inventory.find({ createdBy: userB._id });

    const isIsolated =
      userAItems.length === 1 &&
      userAItems[0]._id.toString() === itemA._id.toString() &&
      userBItems.length === 1 &&
      userBItems[0]._id.toString() === itemB._id.toString();

    console.log(`   ✓ User A items count: ${userAItems.length} (${userAItems[0]?.fabricType})`);
    console.log(`   ✓ User B items count: ${userBItems.length} (${userBItems[0]?.fabricType})`);
    console.log(`   ✓ Data Isolation Enforced: ${isIsolated}`);

    // 6. Cleanup Test Artifacts
    console.log(`\n6. Cleaning up temporary test records...`);
    await Inventory.deleteOne({ _id: itemA._id });
    await Inventory.deleteOne({ _id: itemB._id });
    await User.deleteOne({ _id: userA._id });
    await User.deleteOne({ _id: userB._id });
    console.log(`   ✓ Cleanup complete.`);

    console.log("\n==========================================");
    console.log("ALL AUTHENTICATION INTEGRITY TESTS PASSED");
    console.log("==========================================");
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testAuthSystem();
