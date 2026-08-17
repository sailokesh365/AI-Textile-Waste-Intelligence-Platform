const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const { loginUser } = require("../controllers/authController");

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

async function resetAndVerifyAll() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  await mongoose.connect(mongoUri);

  const defaultPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const accountsToEnsure = [
    { email: "sailokesh365@gmail.com", name: "Sai Lokesh Reddy Pannala", role: "Admin" },
    { email: "hello@gmail.com", name: "Hello Admin", role: "Admin" },
    { email: "hello123@gmail.com", name: "Hello User", role: "User" },
  ];

  console.log("==========================================");
  console.log(`Setting password to "${defaultPassword}" for all primary accounts...`);
  console.log("==========================================");

  for (const acc of accountsToEnsure) {
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = await User.create({
        name: acc.name,
        email: acc.email,
        password: hashedPassword,
        role: acc.role,
      });
      console.log(`✓ Re-created account: ${acc.email} (ID: ${user._id})`);
    } else {
      user.password = hashedPassword;
      if (acc.role === "Admin") user.role = "Admin";
      await user.save();
      console.log(`✓ Updated password for existing account: ${acc.email} (ID: ${user._id})`);
    }

    // Verify login API call
    const res = createMockRes();
    await loginUser({ body: { email: acc.email, password: defaultPassword } }, res);

    if (res.statusCode === 200) {
      console.log(`  ✓ Login test PASSED for ${acc.email} (HTTP 200, Token issued)`);
    } else {
      console.error(`  ✗ Login test FAILED for ${acc.email}: ${res.body?.message}`);
    }
  }

  await mongoose.disconnect();
}

resetAndVerifyAll();
