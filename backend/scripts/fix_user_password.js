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

async function setAndVerifyPassword() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  await mongoose.connect(mongoUri);

  const email = "sailokesh365@gmail.com";
  const targetPassword = "Sailokesh@2026";

  const user = await User.findOne({ email });
  if (!user) {
    console.log(`User ${email} not found.`);
    await mongoose.disconnect();
    return;
  }

  // Update password hash safely
  user.password = await bcrypt.hash(targetPassword, 10);
  await user.save();
  console.log(`✓ Updated password for ${email} to: "${targetPassword}"`);

  // Verify loginUser controller
  const req = {
    body: {
      email,
      password: targetPassword,
    },
  };
  const res = createMockRes();
  await loginUser(req, res);

  console.log(`✓ Login API Status Code: ${res.statusCode}`);
  console.log(`✓ Login Response Message: ${res.body?.message}`);
  console.log(`✓ Token Issued: ${Boolean(res.body?.token)}`);
  console.log(`✓ Logged-in User: ${res.body?.user?.name} (${res.body?.user?.email}, Role: ${res.body?.user?.role})`);

  await mongoose.disconnect();
}

setAndVerifyPassword();
