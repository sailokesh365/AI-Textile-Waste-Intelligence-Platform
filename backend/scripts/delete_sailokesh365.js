const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Inventory = require("../models/Inventory");
const UploadedImage = require("../models/UploadedImage");
const MaterialClassification = require("../models/MaterialClassification");
const WasteClassification = require("../models/WasteClassification");
const Analysis = require("../models/Analysis");
const SustainabilityRecord = require("../sustainability/models/sustainabilityModel");

async function deleteSailokesh365() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  await mongoose.connect(mongoUri);

  const targetEmail = "sailokesh365@gmail.com";
  const user = await User.findOne({ email: targetEmail });

  if (!user) {
    console.log(`Account ${targetEmail} not found in database.`);
    await mongoose.disconnect();
    return;
  }

  const userId = user._id;
  console.log(`Found account to delete: ${user.name} (${user.email}, ID: ${userId})`);

  // Clean up any associated user data
  await Inventory.deleteMany({ createdBy: userId });
  await UploadedImage.deleteMany({ createdBy: userId });
  await MaterialClassification.deleteMany({ createdBy: userId });
  await WasteClassification.deleteMany({ createdBy: userId });
  await Analysis.deleteMany({ createdBy: userId });
  await SustainabilityRecord.deleteMany({ createdBy: userId });

  // Delete user account
  await User.deleteOne({ _id: userId });
  console.log(`✓ Successfully deleted user account: ${targetEmail}`);

  // List remaining active accounts
  const remaining = await User.find({});
  console.log(`\nRemaining active accounts in MongoDB (${remaining.length}):`);
  remaining.forEach((u) => {
    console.log(`  - ${u.name} (${u.email}, Role: ${u.role})`);
  });

  await mongoose.disconnect();
}

deleteSailokesh365();
