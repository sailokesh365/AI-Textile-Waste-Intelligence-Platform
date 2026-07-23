const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getClassifications } = require("../controllers/classificationController");

// @route   GET /api/history
// @desc    Get user's past classification analyses history list
// @access  Protected
router.get("/", protect, getClassifications);

module.exports = router;
