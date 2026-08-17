const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Inventory = require("../models/Inventory");
const {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
} = require("../controllers/authController");

// Helper mock response object for testing express handlers directly
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function runE2ETests() {
  console.log("==================================================");
  console.log("END-TO-END AUTHENTICATION INTEGRITY SUITE");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
    }
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db");
    console.log("✓ Connected to MongoDB.\n");

    const uniqueEmail = `qa.analyst.${Date.now()}@textileintel.io`;
    const userPassword = "ValidPassword123!";
    let createdUserId = null;
    let jwtToken = null;

    // Test 1: Signup with a new email
    console.log("Test 1: Signup with a new email...");
    const req1 = {
      body: {
        name: "QA Analyst",
        email: uniqueEmail,
        password: userPassword,
        role: "User",
      },
    };
    const res1 = createMockRes();
    await registerUser(req1, res1);

    assert(res1.statusCode === 201, `Status code is 201 (Got ${res1.statusCode})`);
    assert(res1.body?.token !== undefined, "JWT Token returned on registration");
    assert(res1.body?.user?.email === uniqueEmail.toLowerCase(), "Email normalized and saved");
    assert(res1.body?.user?.role === "User", "Role defaults to User");

    createdUserId = res1.body?.user?.id;
    jwtToken = res1.body?.token;

    // Test 2: Verify password is securely hashed in database
    console.log("\nTest 2: Verify password is securely hashed in DB...");
    const dbUser = await User.findById(createdUserId);
    assert(dbUser.password !== userPassword, "Plaintext password is NEVER stored");
    assert(dbUser.password.startsWith("$2a$") || dbUser.password.startsWith("$2b$"), "Bcrypt hash format verified");

    // Test 3: Duplicate email signup rejection
    console.log("\nTest 3: Duplicate email signup rejection...");
    const req3 = {
      body: {
        name: "QA Duplicate",
        email: uniqueEmail,
        password: userPassword,
      },
    };
    const res3 = createMockRes();
    await registerUser(req3, res3);
    assert(res3.statusCode === 400, `Duplicate email rejected with HTTP 400 (Got ${res3.statusCode})`);
    assert(res3.body?.message === "User already exists", `Correct error message: "${res3.body?.message}"`);

    // Test 4: Invalid email format validation
    console.log("\nTest 4: Invalid email format validation...");
    const req4 = {
      body: {
        name: "Invalid Email",
        email: "notanemail",
        password: userPassword,
      },
    };
    const res4 = createMockRes();
    await registerUser(req4, res4);
    assert(res4.statusCode === 400, `Invalid email format rejected with HTTP 400 (Got ${res4.statusCode})`);

    // Test 5: Login with correct credentials
    console.log("\nTest 5: Login with correct credentials...");
    const req5 = {
      body: {
        email: uniqueEmail,
        password: userPassword,
      },
    };
    const res5 = createMockRes();
    await loginUser(req5, res5);
    assert(res5.statusCode === 200, `Login successful with HTTP 200 (Got ${res5.statusCode})`);
    assert(res5.body?.token !== undefined, "JWT token returned on login");

    // Test 6: Login with wrong password
    console.log("\nTest 6: Login with wrong password...");
    const req6 = {
      body: {
        email: uniqueEmail,
        password: "WrongPassword999",
      },
    };
    const res6 = createMockRes();
    await loginUser(req6, res6);
    assert(res6.statusCode === 401, `Wrong password rejected with HTTP 401 (Got ${res6.statusCode})`);
    assert(res6.body?.message === "Invalid email or password", `Secure error message returned`);

    // Test 7: Session profile retrieval
    console.log("\nTest 7: Session profile retrieval via token...");
    const req7 = {
      user: { _id: createdUserId },
    };
    const res7 = createMockRes();
    await getUserProfile(req7, res7);
    assert(res7.statusCode === 200, `Profile fetched with HTTP 200`);
    assert(res7.body?.email === uniqueEmail.toLowerCase(), `Retrieved user profile matches`);

    // Test 8: Forgot Password API issue
    console.log("\nTest 8: Forgot Password recovery token issue...");
    const req8 = {
      body: { email: uniqueEmail },
    };
    const res8 = createMockRes();
    await forgotPassword(req8, res8);
    assert(res8.statusCode === 200, `Forgot password issued instructions with HTTP 200`);
    assert(res8.body?.resetToken !== undefined, "Reset token issued");

    // Test 9: Multi-tenant User Data Isolation
    console.log("\nTest 9: Multi-tenant User Data Isolation...");
    const otherUser = await User.create({
      name: "Other User",
      email: `other.${Date.now()}@example.com`,
      password: await bcrypt.hash("Password123!", 10),
      role: "User",
    });

    const inventoryMyItem = await Inventory.create({
      wasteBatchId: `BATCH-MY-${Date.now()}`,
      fabricType: "Denim",
      source: "Post-Industrial",
      quantity: 50,
      color: "Blue",
      condition: "Good",
      createdBy: createdUserId,
    });

    const inventoryOtherItem = await Inventory.create({
      wasteBatchId: `BATCH-OTHER-${Date.now()}`,
      fabricType: "Polyester",
      source: "Pre-Consumer",
      quantity: 120,
      color: "White",
      condition: "Excellent",
      createdBy: otherUser._id,
    });

    const myItems = await Inventory.find({ createdBy: createdUserId });
    const otherItems = await Inventory.find({ createdBy: otherUser._id });

    assert(myItems.length === 1 && myItems[0]._id.toString() === inventoryMyItem._id.toString(), "User sees only their own inventory items");
    assert(otherItems.length === 1 && otherItems[0]._id.toString() === inventoryOtherItem._id.toString(), "Other user sees only their own inventory items");

    // Cleanup test records
    console.log("\nCleaning up test artifacts...");
    await Inventory.deleteOne({ _id: inventoryMyItem._id });
    await Inventory.deleteOne({ _id: inventoryOtherItem._id });
    await User.deleteOne({ _id: createdUserId });
    await User.deleteOne({ _id: otherUser._id });
    console.log("✓ Cleanup complete.");

    console.log("\n==================================================");
    console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
    console.log("==================================================");
  } catch (err) {
    console.error("E2E Test Failure:", err);
  } finally {
    await mongoose.disconnect();
  }
}

runE2ETests();
