const { classifyTextileImage, SUPPORTED_MATERIALS } = require("../services/aiService");
const { materialProfiles } = require("../services/materialKnowledge");

// @desc    Upload textile image and run AI material classification
// @route   POST /api/analysis/classify
// @access  Protected
const classifyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid textile image (JPG, JPEG, or PNG) for analysis.",
      });
    }

    // Run AI preprocessing and material classification
    const analysisResult = await classifyTextileImage(req.file);

    // Construct accessible image URL relative to server root
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      prediction: analysisResult.prediction,
      materialInfo: analysisResult.materialInfo,
      preprocessedMetadata: analysisResult.preprocessedMetadata,
      imageUrl,
      uploadedFile: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("AI Classification Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to analyze textile image.",
    });
  }
};

// @desc    Get all supported textile materials and classification metadata
// @route   GET /api/analysis/materials
// @access  Protected
const getSupportedMaterials = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      supportedMaterials: SUPPORTED_MATERIALS,
      profiles: materialProfiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch supported materials.",
    });
  }
};

module.exports = {
  classifyImage,
  getSupportedMaterials,
};
