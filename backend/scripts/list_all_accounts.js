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

async function listAccounts() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/textile_waste_db";
  await mongoose.connect(mongoUri);

  const users = await User.find({}).sort({ createdAt: 1 }).lean();
  
  const accountDetails = [];

  for (const u of users) {
    const invCount = await Inventory.countDocuments({ createdBy: u._id });
    const imgCount = await UploadedImage.countDocuments({ createdBy: u._id });
    const matCount = await MaterialClassification.countDocuments({ createdBy: u._id });
    const wasteCount = await WasteClassification.countDocuments({ createdBy: u._id });
    const analysisCount = await Analysis.countDocuments({ createdBy: u._id });
    const sustCount = await SustainabilityRecord.countDocuments({ createdBy: u._id });

    const totalData = invCount + imgCount + matCount + wasteCount + analysisCount + sustCount;

    accountDetails.push({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : "N/A",
      inventoryCount: invCount,
      analysisCount: analysisCount,
      totalLinkedData: totalData,
    });
  }

  console.log(JSON.stringify(accountDetails, null, 2));

  await mongoose.disconnect();
}

listAccounts();
