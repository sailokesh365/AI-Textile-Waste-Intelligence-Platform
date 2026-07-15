const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    wasteBatchId: {
      type: String,
      required: [true, "Waste Batch ID is required"],
      trim: true,
    },
    fabricType: {
      type: String,
      required: [true, "Fabric Type is required"],
      trim: true,
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      trim: true,
    },
    collectionDate: {
      type: Date,
      required: [true, "Collection Date is required"],
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
