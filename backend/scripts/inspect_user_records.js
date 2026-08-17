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

async function inspectUserRecords() {
  console.log("==========================================");
  console.log("DATABASE USER RECORDS & DATA LINKAGE AUDIT");
  console.log("==========================================");

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db");
    console.log("✓ Connected to MongoDB.\n");

    const users = await User.find({}).sort({ createdAt: 1 });
    console.log(`Found ${users.length} user records in total:\n`);

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const invCount = await Inventory.countDocuments({ createdBy: u._id });
      const imgCount = await UploadedImage.countDocuments({ createdBy: u._id });
      const matCount = await MaterialClassification.countDocuments({ createdBy: u._id });
      const wasteCount = await WasteClassification.countDocuments({ createdBy: u._id });
      const analysisCount = await Analysis.countDocuments({ createdBy: u._id });
      const sustCount = await SustainabilityRecord.countDocuments({ createdBy: u._id });

      const totalOwnedData = invCount + imgCount + matCount + wasteCount + analysisCount + sustCount;

      console.log(`User #${i + 1}:`);
      console.log(`  ID: ${u._id}`);
      console.log(`  Name: ${u.name}`);
      console.log(`  Email: "${u.email}" (lowercase: "${u.email.toLowerCase()}")`);
      console.log(`  Role: ${u.role}`);
      console.log(`  Created: ${u.createdAt}`);
      console.log(`  Data Linkage:`);
      console.log(`    - Inventory: ${invCount}`);
      console.log(`    - Uploaded Images: ${imgCount}`);
      console.log(`    - Material Classifications: ${matCount}`);
      console.log(`    - Waste Classifications: ${wasteCount}`);
      console.log(`    - Analysis: ${analysisCount}`);
      console.log(`    - Sustainability Records: ${sustCount}`);
      console.log(`    - TOTAL DATA ITEMS LINKED: ${totalOwnedData}`);
      console.log("------------------------------------------");
    }

  } catch (err) {
    console.error("User Audit Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectUserRecords();
