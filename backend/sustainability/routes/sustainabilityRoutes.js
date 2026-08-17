/**
 * Sustainability Intelligence Engine - Express Routes
 * 
 * Maps HTTP endpoints to validation middleware and controller functions.
 */

const express = require("express");
const router = express.Router();
const sustainabilityController = require("../controller/sustainabilityController");
const { validateAnalyzeRequest } = require("../middleware/sustainabilityValidator");
const { protect } = require("../../middleware/authMiddleware");

/**
 * @route   GET /api/sustainability/health
 * @desc    Module health check
 */
router.get("/health", sustainabilityController.getHealth);

/**
 * @route   GET /api/sustainability/history
 * @desc    Get sustainability analysis history
 */
router.get("/history", protect, sustainabilityController.getHistory);

/**
 * @route   GET /api/sustainability/history/:id
 * @desc    Get single sustainability analysis record by ID
 */
router.get("/history/:id", protect, sustainabilityController.getRecordById);

/**
 * @route   POST /api/sustainability/analyze
 * @desc    Analyze textile waste sustainability impact
 */
router.post("/analyze", protect, validateAnalyzeRequest, sustainabilityController.analyzeSustainability);

module.exports = router;
