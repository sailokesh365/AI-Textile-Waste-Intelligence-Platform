const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");

async function inspectRemainingPass() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  await mongoose.connect(mongoUri);

  const users = await User.find({});
  console.log(`Found ${users.length} remaining users:`);

  const commonPasses = [
    "hello",
    "hello123",
    "hello12345",
    "Hello@123",
    "Hello@12345",
    "Hello@2026",
    "123456",
    "12345678",
    "password",
    "Password123!",
  ];

  for (const u of users) {
    console.log(`\nUser: ${u.name} (${u.email}) | ID: ${u._id} | Role: ${u.role}`);
    let found = false;
    for (const p of commonPasses) {
      if (await bcrypt.compare(p, u.password)) {
        console.log(`  ✓ Password matches: "${p}"`);
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`  ✗ Password hash does not match common list.`);
    }
  }

  await mongoose.disconnect();
}

inspectRemainingPass();
