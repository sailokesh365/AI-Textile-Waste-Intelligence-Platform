import React, { useState } from "react";
import axiosInstance from "../Shared/axiosInstance";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import ImageDropzone from "./ImageDropzone";
import AnalysisResultCard from "./AnalysisResultCard";

const ImageAnalysisPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'uploading' | 'analyzing' | 'completed' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setStatus("idle");
    setError("");
    setAnalysisResult(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setStatus("idle");
    setError("");
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a textile image to analyze.");
      return;
    }

    try {
      setStatus("uploading");
      setUploadProgress(0);
      setStatusMessage("Uploading textile image to AI processing cluster...");
      setError("");
      setAnalysisResult(null);

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await axiosInstance.post("/analysis/classify", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
            if (percentCompleted === 100) {
              setStatus("analyzing");
              setStatusMessage("Preprocessing image & executing deep neural classification...");
            }
          }
        },
      });

      if (response.data && response.data.success) {
        setAnalysisResult(response.data);
        setStatus("completed");
        setStatusMessage("Analysis completed successfully.");
      } else {
        throw new Error(response.data?.message || "Failed to analyze image.");
      }
    } catch (err) {
      console.error("Analysis Error:", err);
      setStatus("error");
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred during AI image classification.";
      setError(errMsg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus("idle");
    setError("");
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                AI Textile Image Analysis Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                Enterprise Edition
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Deep convolutional neural network for automated textile material classification and circular grading
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>AI Inference Engine: Active</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          {/* Dropzone Section */}
          <ImageDropzone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClearFile={handleClearFile}
            onAnalyze={handleAnalyze}
            status={status}
            uploadProgress={uploadProgress}
            statusMessage={statusMessage}
            error={error}
            setError={setError}
          />

          {/* Result Card Section */}
          {status === "completed" && analysisResult && (
            <AnalysisResultCard result={analysisResult} onReset={handleReset} />
          )}

          {/* Supported Materials Overview Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Supported Material Classification Catalog
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our model accurately distinguishes between 10 fundamental textile categories for circular economy sorting
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">
                Model v2.4 (High Precision)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: "Cotton", type: "Cellulosic", color: "border-blue-200 bg-blue-50/50" },
                { name: "Polyester", type: "Synthetic", color: "border-purple-200 bg-purple-50/50" },
                { name: "Wool", type: "Protein", color: "border-amber-200 bg-amber-50/50" },
                { name: "Silk", type: "Protein", color: "border-pink-200 bg-pink-50/50" },
                { name: "Linen", type: "Bast Cellulosic", color: "border-green-200 bg-green-50/50" },
                { name: "Denim", type: "Heavy Cotton", color: "border-indigo-200 bg-indigo-50/50" },
                { name: "Nylon", type: "Polyamide", color: "border-cyan-200 bg-cyan-50/50" },
                { name: "Rayon", type: "Regenerated", color: "border-teal-200 bg-teal-50/50" },
                { name: "Acrylic", type: "Synthetic", color: "border-rose-200 bg-rose-50/50" },
                { name: "Mixed Fabrics", type: "Multi-Blend", color: "border-slate-300 bg-slate-100/60" },
              ].map((mat) => (
                <div
                  key={mat.name}
                  className={`p-3.5 rounded-xl border ${mat.color} transition hover:shadow-xs`}
                >
                  <p className="text-sm font-bold text-slate-800">{mat.name}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">{mat.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImageAnalysisPage;
