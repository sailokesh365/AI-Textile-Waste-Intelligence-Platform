/**
 * Recycling Recommendation Engine - Express Routes
 */

const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const { validateRecommendationRequest } = require("../middleware/recommendationValidator");
const { protect } = require("../../middleware/authMiddleware");

router.get("/health", recommendationController.getHealth);
router.get("/history", protect, recommendationController.getHistory);
router.post("/evaluate", protect, validateRecommendationRequest, recommendationController.evaluateRecommendation);

module.exports = router;
