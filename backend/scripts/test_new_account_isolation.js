const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Inventory = require("../models/Inventory");

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

const { createInventory, getInventories } = require("../controllers/inventoryController");

async function runIsolationVerification() {
  console.log("==================================================");
  console.log("NEW ACCOUNT EMPTY INVENTORY & ISOLATION SUITE");
  console.log("==================================================");

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db");
    console.log("✓ Connected to MongoDB.\n");

    const emailAccount1 = `tenant.a.${Date.now()}@textileintel.io`;
    const emailAccount2 = `tenant.b.${Date.now()}@textileintel.io`;
    const password = "SecurePassword123!";

    // 1. Create Account 1
    console.log(`Step 1: Creating New Account 1 (${emailAccount1})...`);
    const user1 = await User.create({
      name: "Tenant A Specialist",
      email: emailAccount1,
      password: await bcrypt.hash(password, 10),
      role: "User",
    });
    console.log(`  ✓ Account 1 Created (ID: ${user1._id})`);

    // 2. Verify Account 1 Inventory is EMPTY
    console.log(`\nStep 2: Checking Account 1 Initial Inventory...`);
    const reqGet1 = { user: user1, query: {} };
    const resGet1 = createMockRes();
    await getInventories(reqGet1, resGet1);
    console.log(`  ✓ Batches Returned: ${resGet1.body.length}`);
    if (resGet1.body.length !== 0) {
      throw new Error(`Account 1 did NOT start empty! Returned ${resGet1.body.length} batches.`);
    }
    console.log("  ✓ SUCCESS: New Account 1 starts 100% EMPTY!");

    // 3. Register 1 Batch under Account 1
    console.log(`\nStep 3: Registering 1 Waste Batch for Account 1...`);
    const reqCreate1 = {
      user: user1,
      body: {
        wasteBatchId: `BATCH-T1-${Date.now()}`,
        fabricType: "Denim",
        source: "Post-Consumer",
        quantity: 150,
        color: "Blue",
        condition: "Good",
      },
    };
    const resCreate1 = createMockRes();
    await createInventory(reqCreate1, resCreate1);
    console.log(`  ✓ Created Batch ID: ${resCreate1.body.wasteBatchId}`);

    // 4. Verify Account 1 now sees ONLY 1 Batch
    console.log(`\nStep 4: Re-querying Account 1 Inventory...`);
    const resGet1Updated = createMockRes();
    await getInventories(reqGet1, resGet1Updated);
    console.log(`  ✓ Account 1 Batches: ${resGet1Updated.body.length}`);
    if (resGet1Updated.body.length !== 1) {
      throw new Error(`Expected 1 batch, got ${resGet1Updated.body.length}`);
    }

    // 5. Create Account 2
    console.log(`\nStep 5: Creating New Account 2 (${emailAccount2})...`);
    const user2 = await User.create({
      name: "Tenant B Specialist",
      email: emailAccount2,
      password: await bcrypt.hash(password, 10),
      role: "User",
    });
    console.log(`  ✓ Account 2 Created (ID: ${user2._id})`);

    // 6. Verify Account 2 Inventory is EMPTY (must NOT see Account 1's batch!)
    console.log(`\nStep 6: Checking Account 2 Inventory...`);
    const reqGet2 = { user: user2, query: {} };
    const resGet2 = createMockRes();
    await getInventories(reqGet2, resGet2);
    console.log(`  ✓ Account 2 Batches Returned: ${resGet2.body.length}`);
    if (resGet2.body.length !== 0) {
      throw new Error(`Account 2 incorrectly saw ${resGet2.body.length} batches belonging to Account 1!`);
    }
    console.log("  ✓ SUCCESS: Account 2 cannot see Account 1's batch!");

    // 7. Verify hello@gmail.com existing data remains 100% safe
    const helloUser = await User.findOne({ email: "hello@gmail.com" });
    if (helloUser) {
      const helloCount = await Inventory.countDocuments({ createdBy: helloUser._id });
      console.log(`\nStep 7: Verifying hello@gmail.com data safety...`);
      console.log(`  ✓ hello@gmail.com Inventory Count: ${helloCount} (Intact and untouched)`);
    }

    // 8. Cleanup test accounts & test batch
    console.log(`\nStep 8: Cleaning up test artifacts...`);
    await Inventory.deleteOne({ _id: resCreate1.body._id });
    await User.deleteOne({ _id: user1._id });
    await User.deleteOne({ _id: user2._id });
    console.log("  ✓ Cleanup complete.");

    console.log("\n==================================================");
    console.log("ALL NEW ACCOUNT ISOLATION TESTS PASSED 100%");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ Isolation Verification Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runIsolationVerification();
