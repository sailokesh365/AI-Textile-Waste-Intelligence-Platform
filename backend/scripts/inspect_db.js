const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/../.env" });

const User = require("../models/User");
const Inventory = require("../models/Inventory");
const Analysis = require("../models/Analysis");
const UploadedImage = require("../models/UploadedImage");
const MaterialClassification = require("../models/MaterialClassification");
const WasteClassification = require("../models/WasteClassification");
const SustainabilityRecord = require("../sustainability/models/sustainabilityModel");

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db");
    console.log("=== DB Inspection ===");
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach((u) => {
      console.log(` - ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, CreatedAt: ${u.createdAt}`);
    });

    const inventoryCount = await Inventory.countDocuments({});
    const analysisCount = await Analysis.countDocuments({});
    const uploadedCount = await UploadedImage.countDocuments({});
    const matClassCount = await MaterialClassification.countDocuments({});
    const wasteClassCount = await WasteClassification.countDocuments({});
    const sustCount = await SustainabilityRecord.countDocuments({});

    console.log("\nDocument Counts:");
    console.log(` - Inventory: ${inventoryCount}`);
    console.log(` - Analysis: ${analysisCount}`);
    console.log(` - UploadedImage: ${uploadedCount}`);
    console.log(` - MaterialClassification: ${matClassCount}`);
    console.log(` - WasteClassification: ${wasteClassCount}`);
    console.log(` - SustainabilityRecord: ${sustCount}`);

    // Check ownership breakdown
    for (const u of users) {
      console.log(`\nData owned by user ${u.email} (${u._id}):`);
      console.log(` - Inventory: ${await Inventory.countDocuments({ createdBy: u._id })}`);
      console.log(` - Analysis: ${await Analysis.countDocuments({ createdBy: u._id })}`);
      console.log(` - UploadedImage: ${await UploadedImage.countDocuments({ createdBy: u._id })}`);
      console.log(` - MaterialClassification: ${await MaterialClassification.countDocuments({ createdBy: u._id })}`);
      console.log(` - WasteClassification: ${await WasteClassification.countDocuments({ createdBy: u._id })}`);
      console.log(` - SustainabilityRecord: ${await SustainabilityRecord.countDocuments({ createdBy: u._id })}`);
    }

    // Check unowned records (createdBy is null, missing, or invalid)
    const validUserIds = users.map((u) => u._id);
    console.log("\nUnowned / Orphaned Data:");
    console.log(` - Inventory: ${await Inventory.countDocuments({ createdBy: { $nin: validUserIds } })}`);
    console.log(` - Analysis: ${await Analysis.countDocuments({ createdBy: { $nin: validUserIds } })}`);
    console.log(` - UploadedImage: ${await UploadedImage.countDocuments({ createdBy: { $nin: validUserIds } })}`);
    console.log(` - MaterialClassification: ${await MaterialClassification.countDocuments({ createdBy: { $nin: validUserIds } })}`);
    console.log(` - WasteClassification: ${await WasteClassification.countDocuments({ createdBy: { $nin: validUserIds } })}`);
    console.log(` - SustainabilityRecord: ${await SustainabilityRecord.countDocuments({ createdBy: { $nin: validUserIds } })}`);

  } catch (err) {
    console.error("Inspection error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

inspect();
