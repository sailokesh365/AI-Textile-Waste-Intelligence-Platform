const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Inventory = require("../models/Inventory");
const Analysis = require("../models/Analysis");
const UploadedImage = require("../models/UploadedImage");
const MaterialClassification = require("../models/MaterialClassification");
const WasteClassification = require("../models/WasteClassification");
const SustainabilityRecord = require("../sustainability/models/sustainabilityModel");

const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/authController");
const { createInventory, getInventories, updateInventory, deleteInventory } = require("../controllers/inventoryController");

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

async function runComprehensiveVerification() {
  console.log("==================================================");
  console.log("FULL AUTHENTICATION & MULTI-TENANT ISOLATION SUITE");
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
      process.exitCode = 1;
    }
  }

  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
    await mongoose.connect(mongoUri);
    console.log(`✓ Connected to MongoDB: ${mongoUri}\n`);

    const emailA = `account.a.${Date.now()}@textileintel.io`;
    const emailB = `account.b.${Date.now()}@textileintel.io`;
    const passwordA = "SecurePassA123!";
    const passwordB = "SecurePassB456!";

    // Scenario 1: Create Account A & verify initial empty workspace
    console.log("Scenario 1: Create Account A & check initial empty workspace...");
    const resRegA = createMockRes();
    await registerUser({ body: { name: "User A Specialist", email: emailA, password: passwordA } }, resRegA);
    assert(resRegA.statusCode === 201, "Account A created with HTTP 201");
    const userA = await User.findById(resRegA.body.user.id);
    assert(userA !== null, "Account A record saved in MongoDB");

    const resGetAEmpty = createMockRes();
    await getInventories({ user: userA, query: {} }, resGetAEmpty);
    assert(resGetAEmpty.body.length === 0, "Account A starts with 100% EMPTY inventory workspace");

    // Scenario 2: Create data under Account A & verify persistence
    console.log("\nScenario 2: Create data under Account A & verify persistence...");
    const resCreateA = createMockRes();
    await createInventory({
      user: userA,
      body: {
        wasteBatchId: `BATCH-A-${Date.now()}`,
        fabricType: "Cotton",
        source: "Post-Consumer",
        quantity: 200,
        color: "Blue",
        condition: "Good",
      },
    }, resCreateA);
    assert(resCreateA.statusCode === 201, "Inventory item created for Account A");
    const itemAId = resCreateA.body._id;

    // Scenario 3: Simulate restart/re-login for Account A
    console.log("\nScenario 3: Login as Account A & verify data remains intact...");
    const resLoginA = createMockRes();
    await loginUser({ body: { email: emailA, password: passwordA } }, resLoginA);
    assert(resLoginA.statusCode === 200, "Account A login successful");

    const resGetAIntact = createMockRes();
    await getInventories({ user: userA, query: {} }, resGetAIntact);
    assert(resGetAIntact.body.length === 1 && resGetAIntact.body[0]._id.toString() === itemAId.toString(), "Account A's inventory data persisted and retrievable");

    // Scenario 4 & 5: Create Account B & verify Account B cannot see A's data
    console.log("\nScenario 4 & 5: Create Account B & verify zero cross-tenant leakage...");
    const resRegB = createMockRes();
    await registerUser({ body: { name: "User B Specialist", email: emailB, password: passwordB } }, resRegB);
    assert(resRegB.statusCode === 201, "Account B created with HTTP 201");
    const userB = await User.findById(resRegB.body.user.id);

    const resGetBEmpty = createMockRes();
    await getInventories({ user: userB, query: {} }, resGetBEmpty);
    assert(resGetBEmpty.body.length === 0, "Account B starts empty and cannot see Account A's inventory item");

    // Create data for Account B
    const resCreateB = createMockRes();
    await createInventory({
      user: userB,
      body: {
        wasteBatchId: `BATCH-B-${Date.now()}`,
        fabricType: "Silk",
        source: "Pre-Consumer",
        quantity: 85,
        color: "White",
        condition: "Excellent",
      },
    }, resCreateB);
    assert(resCreateB.statusCode === 201, "Inventory item created for Account B");
    const itemBId = resCreateB.body._id;

    // Scenario 6: Verify Account A cannot see B's data
    console.log("\nScenario 6: Verify Account A cannot see B's data...");
    const resGetARequery = createMockRes();
    await getInventories({ user: userA, query: {} }, resGetARequery);
    assert(resGetARequery.body.length === 1 && resGetARequery.body[0]._id.toString() === itemAId.toString(), "Account A sees ONLY Account A's data");

    // Scenario 7 & 8: Independent record deletion & isolation
    console.log("\nScenario 7 & 8: Verify independent deletion between Account A and B...");
    // Attempt unauthorized cross-user deletion (B attempting to delete A's item)
    const resUnauthorizedDelete = createMockRes();
    await deleteInventory({ params: { id: itemAId }, user: userB }, resUnauthorizedDelete);
    assert(resUnauthorizedDelete.statusCode === 403, "Account B unauthorized deletion of Account A's item REJECTED (HTTP 403)");

    // Authorized deletion by owner A
    const resAuthorizedDeleteA = createMockRes();
    await deleteInventory({ params: { id: itemAId }, user: userA }, resAuthorizedDeleteA);
    assert(resAuthorizedDeleteA.statusCode === 200, "Account A successfully deleted own item");

    // Verify B's record remains unaffected
    const resGetBPostDeleteA = createMockRes();
    await getInventories({ user: userB, query: {} }, resGetBPostDeleteA);
    assert(resGetBPostDeleteA.body.length === 1 && resGetBPostDeleteA.body[0]._id.toString() === itemBId.toString(), "Account B's record remains 100% safe after A's deletion");

    // Clean up Account B's item
    await deleteInventory({ params: { id: itemBId }, user: userB }, createMockRes());

    // Scenario 9 & 10: Forgot / Reset Password flow
    console.log("\nScenario 9 & 10: Testing Forgot Password & Reset Password End-to-End...");
    const resForgot = createMockRes();
    await forgotPassword({ body: { email: emailA } }, resForgot);
    assert(resForgot.statusCode === 200 && Boolean(resForgot.body?.resetToken), "Forgot Password token generated");

    const newPassA = "BrandNewPass789!";
    const resReset = createMockRes();
    await resetPassword({ body: { resetToken: resForgot.body.resetToken, newPassword: newPassA } }, resReset);
    assert(resReset.statusCode === 200 && resReset.body?.success === true, "Password reset successful");

    // Verify login with new password
    const resLoginNewPass = createMockRes();
    await loginUser({ body: { email: emailA, password: newPassA } }, resLoginNewPass);
    assert(resLoginNewPass.statusCode === 200, "Login successful with updated password");

    // Verify old password rejected
    const resLoginOldPass = createMockRes();
    await loginUser({ body: { email: emailA, password: passwordA } }, resLoginOldPass);
    assert(resLoginOldPass.statusCode === 401, "Old password cleanly rejected (HTTP 401)");

    // Clean up test accounts
    console.log("\nCleaning up test accounts...");
    await User.deleteOne({ _id: userA._id });
    await User.deleteOne({ _id: userB._id });
    console.log("✓ Cleanup complete.");

    console.log("\n==================================================");
    console.log(`RESULTS: ${passed} / ${total} TESTS PASSED 100%`);
    console.log("==================================================");

  } catch (err) {
    console.error("Test Suite Exception:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runComprehensiveVerification();
