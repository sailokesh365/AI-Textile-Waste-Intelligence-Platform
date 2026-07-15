import React from "react";
import { useNavigate } from "react-router-dom";

const AnalysisResultCard = ({ result, onReset }) => {
  const navigate = useNavigate();

  if (!result || !result.prediction) return null;

  const { prediction, materialInfo, imageUrl, uploadedFile } = result;
  const confidence = prediction.confidenceScore || 0;

  // Determine color theme based on confidence percentage
  const getConfidenceBadgeStyle = (score) => {
    if (score >= 90) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (score >= 75) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    } else {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  const formattedTimestamp = prediction.timestamp
    ? new Date(prediction.timestamp).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      })
    : new Date().toLocaleString();

  // Full backend URL or relative path handling
  const fullImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `http://localhost:5000${imageUrl}`
    : null;

  const handleRegisterBatch = () => {
    // Navigate to inventory with pre-filled state for the registration modal
    navigate("/inventory", {
      state: {
        prefillMaterial: prediction.predictedMaterial,
        fromAnalysis: true,
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white border-b border-slate-800">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-400">
            AI Classification Complete
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Material Intelligence Report
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-xs font-medium text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
            ⏱️ {prediction.processingTime || "280ms"}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-green-900/60 text-green-300 border border-green-700 font-semibold">
            ● {prediction.predictionStatus || "Completed"}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Core Prediction Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200/70">
          {/* Uploaded Image Preview */}
          <div className="lg:col-span-1">
            <div className="relative w-full h-64 sm:h-56 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-inner group">
              {fullImageUrl ? (
                <img
                  src={fullImageUrl}
                  alt={prediction.predictedMaterial}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No Image Available
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium truncate">
                {uploadedFile?.originalname || "Uploaded Textile Sample"}
              </div>
            </div>
          </div>

          {/* Primary Material Output & Confidence Score */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Detected Textile Composition
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {prediction.predictedMaterial}
                </h3>
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border ${getConfidenceBadgeStyle(
                    confidence
                  )}`}
                >
                  {confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Analysis Completed: <span className="font-semibold text-slate-700">{formattedTimestamp}</span>
              </p>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Classification Certainty</span>
                <span>{confidence}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Actions inside Prediction Block */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRegisterBatch}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition text-xs sm:text-sm flex items-center space-x-2"
              >
                <span>+ Log as Inventory Batch</span>
              </button>
              <button
                type="button"
                onClick={onReset}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 transition text-xs sm:text-sm"
              >
                Analyze Another Sample
              </button>
            </div>
          </div>
        </div>

        {/* Professional Material Information Card */}
        {materialInfo && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-100/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Professional Material Dossier
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Category: {materialInfo.category || "Standard Textile Fiber"}
                </p>
              </div>
              <span className="px-3 py-1 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800">
                Recycling Readiness:{" "}
                <span className="text-blue-600">{materialInfo.recyclingReadiness || "High"}</span>
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Material Overview
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    {materialInfo.description ||
                      "Textile fiber identified by AI deep feature extraction."}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Recommended Circular Pathway
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 font-medium text-blue-950">
                    {materialInfo.recommendedPathway ||
                      "Mechanical shredding or chemical regeneration based on fiber composition."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Environmental Impact & Sustainability
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    {materialInfo.environmentalImpact ||
                      "Recycling diverts post-consumer waste from landfill and reduces carbon footprint."}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Handling & Sorting Guidelines
                  </h5>
                  <p className="text-slate-700 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-100 text-amber-950">
                    {materialInfo.handlingGuidelines ||
                      "Ensure batch is clean, dry, and free of heavy metallic contaminants before shredding."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResultCard;
