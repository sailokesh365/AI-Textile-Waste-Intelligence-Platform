const express = require("express");
const router = express.Router();
const {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");
const { protect } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, createInventory)
  .get(protect, getInventories);

router.route("/:id")
  .get(protect, getInventoryById)
  .put(protect, updateInventory)
  .delete(protect, deleteInventory);

module.exports = router;
