import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";

const AnalysisReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [materialInfo, setMaterialInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get(`/classification/${id}`);
      if (response.data.success) {
        setReport(response.data.data);
        setMaterialInfo(response.data.materialInfo);
      } else {
        throw new Error(response.data.message || "Failed to load report.");
      }
    } catch (err) {
      console.error("Report Fetch Error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while retrieving the detailed report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const exportCSV = () => {
    if (!report) return;

    const dataRows = [
      ["AI Textile Waste Intelligence Platform - Analysis Report"],
      [],
      ["Report ID", report._id],
      ["Date Created", new Date(report.createdAt).toLocaleString()],
      ["Logged By User ID", report.createdBy?._id || "N/A"],
      ["Specialist Name", report.createdBy?.name || "N/A"],
      [],
      ["Primary Material Classification", report.predictedMaterial],
      ["Material Confidence (%)", report.materialConfidence],
      ["Waste Category Prediction", report.wasteCategory],
      ["Waste Confidence (%)", report.wasteConfidence],
      ["Recyclability Score (%)", report.recyclabilityScore],
      ["Recyclability Grade", report.recyclabilityGrade],
      ["Fabric Condition", report.condition],
      [],
      ["Preprocessing Details"],
      ["Resolution Shape", report.preprocessingMetadata?.resizedShape?.join("x") || "128x128x3"],
      ["Denoise Method", report.preprocessingMetadata?.denoiseMethod || "Bilateral Filter"],
      ["Normalization", report.preprocessingMetadata?.normalization || "Min-Max [0, 1]"],
      ["Average Brightness", report.preprocessingMetadata?.averageBrightness || "N/A"],
      ["Contrast (Std Dev)", report.preprocessingMetadata?.contrastStd || "N/A"],
      [],
      ["Circular Recommendations"],
      ...report.recommendations.map((rec, index) => [`Recommendation ${index + 1}`, rec]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      dataRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TextileIntel-Report-${report._id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">
              Generating report dossier...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-red-800 mb-2">Report Not Found</h2>
            <p className="text-sm text-red-600 mb-4">{error || "The requested analysis report could not be found."}</p>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getRecyclabilityColor = (grade) => {
    switch (grade) {
      case "Green":
        return "border-green-300 text-green-700 bg-green-50";
      case "Yellow":
        return "border-yellow-300 text-yellow-700 bg-yellow-50";
      case "Orange":
        return "border-amber-300 text-amber-700 bg-amber-50";
      case "Red":
        return "border-red-300 text-red-700 bg-red-50";
      default:
        return "border-slate-350 text-slate-700 bg-slate-50";
    }
  };

  const formattedDate = new Date(report.createdAt).toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "medium",
  });

  const fullOriginalUrl = report.imagePath.startsWith("http")
    ? report.imagePath
    : `http://localhost:5000${report.imagePath}`;

  const fullPreprocessedUrl = report.preprocessedImagePath.startsWith("http")
    ? report.preprocessedImagePath
    : `http://localhost:5000${report.preprocessedImagePath}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hide navbar on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center space-x-1"
            >
              <span>← Back to Analytics Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Detailed Material Analysis Dossier
            </h1>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition text-xs flex items-center space-x-2 shadow-2xs"
            >
              <span>📥 Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-xs flex items-center space-x-2 shadow-xs"
            >
              <span>🖨️ Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Print-Only Header */}
        <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
          <h1 className="text-2xl font-black text-slate-900">
            AI TEXTILE WASTE INTELLIGENCE PLATFORM
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Official Material Classification Dossier
          </p>
          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600 mt-3">
            <div>
              <p><strong>Report ID:</strong> {report._id}</p>
              <p><strong>Date Logged:</strong> {formattedDate}</p>
            </div>
            <div>
              <p><strong>Operator:</strong> {report.createdBy?.name} ({report.createdBy?.role})</p>
              <p><strong>Email:</strong> {report.createdBy?.email}</p>
            </div>
          </div>
        </div>

        {/* Side-by-Side Images Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Original Uploaded Texture
            </h3>
            <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={fullOriginalUrl}
                alt="Original textile fabric"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              OpenCV Preprocessed Visual (Resized & Denoised)
            </h3>
            <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={fullPreprocessedUrl}
                alt="Preprocessed textile fabric"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Detailed Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Predictor Outputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Model Outputs & Certainty
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  AI Vision Engine Classifications
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Material Composition
                  </p>
                  <p className="text-3xl font-black text-slate-900 mt-1.5">
                    {report.predictedMaterial}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Confidence: <span className="font-semibold">{report.materialConfidence}%</span>
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${report.materialConfidence}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Waste Stream Allocation
                  </p>
                  <p className="text-3xl font-black text-slate-900 mt-1.5">
                    {report.wasteCategory}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Confidence: <span className="font-semibold">{report.wasteConfidence}%</span>
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${report.wasteConfidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Recyclability score & gauge */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200/60">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                      Recyclability Assessment
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-black text-slate-900">
                        {report.recyclabilityScore}%
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRecyclabilityColor(
                          report.recyclabilityGrade
                        )}`}
                      >
                        {report.recyclabilityGradeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Condition grading: <span className="font-semibold text-slate-700">{report.condition}</span>
                    </p>
                  </div>

                  <div className="flex-1 max-w-[200px] h-3 bg-slate-250 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full ${
                        report.recyclabilityGrade === "Green"
                          ? "bg-green-500"
                          : report.recyclabilityGrade === "Yellow"
                          ? "bg-yellow-500"
                          : report.recyclabilityGrade === "Orange"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${report.recyclabilityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Textile Image Analysis Diagnostics */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Surface Diagnostics & Material Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed AI vision diagnostics covering structure, texture, hue profiling and defect identification
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700">
                <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <span>🧶</span>
                    <span>Fabric & Structure</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Fabric Structure</p>
                      <p className="font-semibold mt-0.5">{report.fabricDetection || report.materialClassification?.fabricDetection || "Woven Structure"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Surface Texture</p>
                      <p className="mt-0.5 leading-relaxed">{report.textureAnalysis || report.materialClassification?.textureAnalysis || "Consistent surface pattern."}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <span>🎨</span>
                    <span>Color Spectrum</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Dominant Colors</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {(report.colorAnalysis?.dominantColors || report.materialClassification?.colorAnalysis?.dominantColors)?.map((color, idx) => (
                          <div key={idx} className="flex items-center space-x-1 border border-slate-250 px-1 py-0.5 rounded bg-white font-mono text-[9px] font-bold">
                            <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300" style={{ backgroundColor: color }}></span>
                            <span>{color}</span>
                          </div>
                        )) || <span>None detected</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Palette Details</p>
                      <p className="mt-0.5 leading-relaxed">{report.colorAnalysis?.paletteDescription || report.materialClassification?.colorAnalysis?.paletteDescription || "No palette data."}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-slate-900">
                    <span>🔍</span>
                    <span>Defects & Wear</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Damage State</p>
                      {(report.damageDetection?.damageDetected || report.wasteClassification?.damageDetection?.damageDetected) ? (
                        <span className="inline-block px-1.5 py-0.2 mt-0.5 bg-red-50 text-red-700 border border-red-200 font-semibold rounded text-[10px]">
                          ⚠️ {report.damageDetection?.damageType || report.wasteClassification?.damageDetection?.damageType}
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.2 mt-0.5 bg-green-50 text-green-700 border border-green-200 font-semibold rounded text-[10px]">
                          ✓ Safe / No Damage
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Contaminants</p>
                      {(report.contaminationDetection?.contaminationDetected || report.wasteClassification?.contaminationDetection?.contaminationDetected) ? (
                        <span className="inline-block px-1.5 py-0.2 mt-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-semibold rounded text-[10px]">
                          ⚠️ {report.contaminationDetection?.contaminationType || report.wasteClassification?.contaminationDetection?.contaminationType}
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.2 mt-0.5 bg-green-50 text-green-700 border border-green-200 font-semibold rounded text-[10px]">
                          ✓ Safe / Clean
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular pathway recommendations */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Circular Sorting Recommendations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable operations directives for waste processing and ledger logging
                </p>
              </div>

              <ul className="space-y-3">
                {report.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 flex items-start space-x-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar: Preprocessing details and dossier profiles */}
          <div className="space-y-6">
            {/* OpenCV Preprocessing Metadata */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                OpenCV Preprocessing Report
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-450 font-medium">Input Tensor Shape</span>
                  <span className="font-semibold text-slate-800">
                    {report.preprocessingMetadata?.resizedShape?.join(" x ") || "128 x 128 x 3"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450 font-medium">Denoising Pipeline</span>
                  <span className="font-semibold text-slate-800">
                    {report.preprocessingMetadata?.denoiseMethod || "Bilateral Filter"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450 font-medium">Normalization Scale</span>
                  <span className="font-semibold text-slate-800">
                    {report.preprocessingMetadata?.normalization || "Min-Max [0, 1]"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-450 font-medium">Average Brightness</span>
                  <span className="font-semibold text-slate-800">
                    {report.preprocessingMetadata?.averageBrightness !== undefined
                      ? report.preprocessingMetadata.averageBrightness
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450 font-medium">Contrast (Standard Dev)</span>
                  <span className="font-semibold text-slate-800">
                    {report.preprocessingMetadata?.contrastStd !== undefined
                      ? report.preprocessingMetadata.contrastStd
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dossier information card */}
            {materialInfo && (
              <div className="bg-slate-900 text-slate-350 p-6 rounded-2xl border border-slate-800 shadow-xs space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Material Dossier
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {materialInfo.name} Profile
                  </h4>
                </div>
                <div className="space-y-4 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Category</p>
                    <p className="text-slate-200 mt-1 font-semibold">{materialInfo.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Description</p>
                    <p className="text-slate-350 mt-1 leading-relaxed">{materialInfo.description}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Recommended Pathway</p>
                    <p className="text-green-400 mt-1 font-semibold">{materialInfo.recommendedPathway}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Hide footer on print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default AnalysisReport;
