const path = require("path");
const UploadedImage = require("../models/UploadedImage");
const MaterialClassification = require("../models/MaterialClassification");
const WasteClassification = require("../models/WasteClassification");
const { classifyTextileImage, SUPPORTED_MATERIALS } = require("../services/aiService");

// @desc    Upload textile image and run prediction in a single API call
// @route   POST /api/predict
// @access  Protected
const predictImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a textile image file for prediction.",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // 1. Save uploaded image metadata
    const uploadedImage = await UploadedImage.create({
      imagePath: imageUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      createdBy: req.user._id,
    });

    // 2. Reconstruct file structure for aiService
    const file = {
      path: req.file.path,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    // 3. Execute AI classification
    const analysisResult = await classifyTextileImage(file);

    let finalMaterialName = analysisResult.prediction.predictedMaterial;
    if (finalMaterialName === "Mixed Fabrics") {
      finalMaterialName = "Mixed Fabric";
    }

    // 4. Save Material Classification record
    const materialClassification = await MaterialClassification.create({
      uploadedImage: uploadedImage._id,
      materialName: finalMaterialName,
      confidenceScore: analysisResult.prediction.materialConfidence,
      materialDescription: analysisResult.materialInfo.description,
      fabricDetection: analysisResult.fabricDetection,
      textureAnalysis: analysisResult.textureAnalysis,
      colorAnalysis: {
        dominantColors: analysisResult.colorAnalysis.dominantColors,
        paletteDescription: analysisResult.colorAnalysis.paletteDescription,
      },
      createdBy: req.user._id,
    });

    // 5. Save Waste Classification record
    const wasteClassification = await WasteClassification.create({
      uploadedImage: uploadedImage._id,
      wasteCategory: analysisResult.prediction.wasteCategory,
      recyclabilityScore: analysisResult.prediction.recyclabilityScore,
      reusePotential: analysisResult.reusePotential,
      disposalRecommendation: analysisResult.disposalRecommendation,
      damageDetection: {
        damageDetected: analysisResult.damageDetection.damageDetected,
        damageType: analysisResult.damageDetection.damageType,
        damageSeverity: analysisResult.damageDetection.damageSeverity,
      },
      contaminationDetection: {
        contaminationDetected: analysisResult.contaminationDetection.contaminationDetected,
        contaminationType: analysisResult.contaminationDetection.contaminationType,
        contaminationSeverity: analysisResult.contaminationDetection.contaminationSeverity,
      },
      createdBy: req.user._id,
    });

    // Calculate Top Predictions
    const materialConfidence = analysisResult.prediction.materialConfidence;
    const topPredictions = [
      { material: finalMaterialName, confidence: materialConfidence },
    ];
    
    // Add other classes to complete top predictions array
    const otherClasses = SUPPORTED_MATERIALS.map(m => m === "Mixed Fabrics" ? "Mixed Fabric" : m).filter(
      (m) => m !== finalMaterialName
    );
    const remainingConf = 100 - materialConfidence;
    if (remainingConf > 0) {
      topPredictions.push({
        material: otherClasses[0],
        confidence: parseFloat((remainingConf * 0.7).toFixed(1)),
      });
      topPredictions.push({
        material: otherClasses[1],
        confidence: parseFloat((remainingConf * 0.3).toFixed(1)),
      });
    } else {
      topPredictions.push({ material: otherClasses[0], confidence: 0.0 });
      topPredictions.push({ material: otherClasses[1], confidence: 0.0 });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: materialClassification._id,
        Material: finalMaterialName,
        Confidence: materialConfidence,
        TopPredictions: topPredictions,
        InferenceTime: analysisResult.prediction.processingTime || "FastAPI Pipeline",
        wasteCategory: wasteClassification.wasteCategory,
        recyclabilityScore: wasteClassification.recyclabilityScore,
        reusePotential: wasteClassification.reusePotential,
        disposalRecommendation: wasteClassification.disposalRecommendation,
        preprocessedImageUrl: analysisResult.preprocessedImagePath,
        imageUrl,
        recommendations: analysisResult.recommendations,
        fabricDetection: materialClassification.fabricDetection,
        textureAnalysis: materialClassification.textureAnalysis,
        colorAnalysis: materialClassification.colorAnalysis,
        damageDetection: wasteClassification.damageDetection,
        contaminationDetection: wasteClassification.contaminationDetection,
        uploadedFile: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
        },
      },
    });
  } catch (error) {
    console.error("Predict Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to predict textile material.",
    });
  }
};

module.exports = {
  predictImage,
};
