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

async function cleanupAccounts() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  await mongoose.connect(mongoUri);

  const keepEmails = ["hello@gmail.com", "hello123@gmail.com"];

  console.log("==========================================");
  console.log("ACCOUNT CLEANUP EXECUTION");
  console.log(`Keeping accounts: ${keepEmails.join(", ")}`);
  console.log("==========================================");

  // 1. Locate users to keep
  const keepUsers = await User.find({ email: { $in: keepEmails } });
  const keepUserIds = keepUsers.map((u) => u._id);

  console.log(`Found ${keepUsers.length} accounts to KEEP:`);
  keepUsers.forEach((u) => console.log(`  - ${u.name} (${u.email}, ID: ${u._id})`));

  // 2. Locate users to delete
  const deleteUsers = await User.find({ email: { $nin: keepEmails } });
  const deleteUserIds = deleteUsers.map((u) => u._id);

  console.log(`\nFound ${deleteUsers.length} accounts to DELETE:`);
  deleteUsers.forEach((u) => console.log(`  - ${u.name} (${u.email}, ID: ${u._id})`));

  // 3. Delete orphaned data owned by deleted users
  const deletedInventory = await Inventory.deleteMany({ createdBy: { $in: deleteUserIds } });
  const deletedImages = await UploadedImage.deleteMany({ createdBy: { $in: deleteUserIds } });
  const deletedMatClass = await MaterialClassification.deleteMany({ createdBy: { $in: deleteUserIds } });
  const deletedWasteClass = await WasteClassification.deleteMany({ createdBy: { $in: deleteUserIds } });
  const deletedAnalyses = await Analysis.deleteMany({ createdBy: { $in: deleteUserIds } });
  const deletedSustainability = await SustainabilityRecord.deleteMany({ createdBy: { $in: deleteUserIds } });

  console.log("\nAssociated Data Cleaned Up:");
  console.log(`  - Inventory items deleted: ${deletedInventory.deletedCount}`);
  console.log(`  - Uploaded Images deleted: ${deletedImages.deletedCount}`);
  console.log(`  - Material Classifications deleted: ${deletedMatClass.deletedCount}`);
  console.log(`  - Waste Classifications deleted: ${deletedWasteClass.deletedCount}`);
  console.log(`  - Analyses deleted: ${deletedAnalyses.deletedCount}`);
  console.log(`  - Sustainability Records deleted: ${deletedSustainability.deletedCount}`);

  // 4. Delete user accounts
  const deletedUserResult = await User.deleteMany({ email: { $nin: keepEmails } });
  console.log(`\n✓ Successfully deleted ${deletedUserResult.deletedCount} user accounts.`);

  // 5. Final audit of remaining accounts & data
  const remainingUsers = await User.find({});
  console.log(`\nRemaining Accounts in DB (${remainingUsers.length}):`);
  for (const u of remainingUsers) {
    const invCount = await Inventory.countDocuments({ createdBy: u._id });
    console.log(`  - ID: ${u._id} | Name: ${u.name} | Email: "${u.email}" | Role: ${u.role} | Inventory Count: ${invCount}`);
  }

  await mongoose.disconnect();
}

cleanupAccounts();
