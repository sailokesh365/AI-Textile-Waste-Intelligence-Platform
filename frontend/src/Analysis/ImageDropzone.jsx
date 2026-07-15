import React, { useState, useRef, useEffect } from "react";

const ImageDropzone = ({
  onFileSelect,
  selectedFile,
  onClearFile,
  onAnalyze,
  status,
  uploadProgress,
  statusMessage,
  error,
  setError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Generate and clean up object URL for instant preview
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const validateAndHandleFile = (file) => {
    setError("");
    if (!file) return;

    // Format validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError("Invalid file format. Please upload JPG, JPEG, or PNG images only.");
      return;
    }

    // Size validation (Max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("File size exceeds 10MB limit. Please choose a smaller textile image.");
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "uploading" && status !== "analyzing") {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (status === "uploading" || status === "analyzing") return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndHandleFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndHandleFile(files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  const isProcessing = status === "uploading" || status === "analyzing";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 transition-all">
      {/* Dropzone Container */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[300px] ${
            isDragging
              ? "border-blue-600 bg-blue-50/70 scale-[1.01]"
              : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            Drag & Drop your textile image here
          </h3>
          <p className="text-sm text-slate-500 mb-4 max-w-sm">
            Or click to browse from your device. Support for high-resolution fabric texture scans or garment photos.
          </p>

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg">JPG, JPEG, PNG</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Max 10 MB</span>
          </div>
        </div>
      ) : (
        /* Preview & Actions Container */
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            {/* Image Thumbnail */}
            <div className="relative w-full md:w-56 h-56 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-inner flex-shrink-0">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Textile Preview"
                  className="w-full h-full object-cover"
                />
              )}
              {!isProcessing && (
                <button
                  type="button"
                  onClick={onClearFile}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition shadow-md text-xs"
                  title="Remove Image"
                >
                  ✕
                </button>
              )}
            </div>

            {/* File Metadata & Status */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  Ready for AI Analysis
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-2 truncate">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium mt-1">
                  <span>Size: {formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>Format: {selectedFile.type.replace("image/", "").toUpperCase()}</span>
                </div>
              </div>

              {/* Progress & Loading State */}
              {isProcessing ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      <span>{statusMessage || "Processing image with AI neural engine..."}</span>
                    </span>
                    <span>{status === "uploading" ? `${uploadProgress}%` : "Running AI"}</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-blue-600 rounded-full transition-all duration-300 ${
                        status === "analyzing" ? "animate-pulse w-full" : ""
                      }`}
                      style={{
                        width: status === "uploading" ? `${uploadProgress}%` : "100%",
                      }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onAnalyze}
                    className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>⚡ Run Material Classification</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-300 transition text-sm"
                  >
                    Change Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
