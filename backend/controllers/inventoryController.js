const Inventory = require("../models/Inventory");

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Protected
const createInventory = async (req, res) => {
  try {
    const {
      wasteBatchId,
      fabricType,
      source,
      quantity,
      color,
      condition,
      collectionDate,
    } = req.body;

    if (
      !wasteBatchId ||
      !fabricType ||
      !source ||
      quantity === undefined ||
      !color ||
      !condition
    ) {
      return res.status(400).json({
        message: "Please provide all required fields (Waste Batch ID, Fabric Type, Source, Quantity, Color, Condition)",
      });
    }

    const inventory = await Inventory.create({
      wasteBatchId,
      fabricType,
      source,
      quantity,
      color,
      condition,
      collectionDate: collectionDate || Date.now(),
      createdBy: req.user._id,
    });

    res.status(201).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Protected
const getInventories = async (req, res) => {
  try {
    const { fabricType, condition, search } = req.query;
    let query = {};

    if (fabricType && fabricType !== "All") {
      query.fabricType = fabricType;
    }
    if (condition && condition !== "All") {
      query.condition = condition;
    }
    if (search) {
      query.$or = [
        { wasteBatchId: { $regex: search, $options: "i" } },
        { fabricType: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
      ];
    }

    const inventories = await Inventory.find(query)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Protected
const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Protected
const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email role");

    res.status(200).json(updatedInventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Protected
const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    await inventory.deleteOne();

    res.status(200).json({ message: "Inventory item removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};
