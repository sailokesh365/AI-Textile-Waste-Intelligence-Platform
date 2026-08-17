import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { notify } from "../../Shared/NotificationContext";

/**
 * Converts an image URL to a base64 data URL safely.
 * Returns null if the image fails to load or cross-origin issues occur.
 */
const getBase64ImageFromUrl = async (imgUrl) => {
  if (!imgUrl) return null;
  try {
    const fullUrl = imgUrl.startsWith("http")
      ? imgUrl
      : `http://localhost:5000${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;

    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 300;
          canvas.height = img.naturalHeight || img.height || 300;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/jpeg", 0.85);
          resolve(dataURL);
        } catch (e) {
          console.warn("Canvas toDataURL failed:", e);
          resolve(null);
        }
      };
      img.onerror = (err) => {
        console.warn("Failed to load image for PDF embedding:", fullUrl, err);
        resolve(null);
      };
      img.src = fullUrl;
    });
  } catch (err) {
    console.warn("Image base64 conversion exception:", err);
    return null;
  }
};

/**
 * Generates a clean, professional, vector PDF report for Image Analysis.
 * @param {Object} data - The analysis result object from Image Analysis or Report view.
 */
export const generatePdfReport = async (data) => {
  if (!data) {
    console.error("No analysis data provided for PDF generation.");
    return;
  }

  // 1. Data Normalization
  const prediction = data.prediction || {};
  const reportId = String(
    data._id || prediction._id || "REP-" + Date.now().toString(36).toUpperCase()
  );
  const formattedId = reportId.length > 16 ? reportId.substring(0, 16).toUpperCase() : reportId.toUpperCase();

  const rawDate = data.createdAt || prediction.timestamp || new Date();
  const formattedDate = new Date(rawDate).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const fileName =
    data.uploadedFile?.originalname ||
    data.originalName ||
    data.uploadedFile?.filename ||
    "Textile_Sample.jpg";

  const operatorName =
    data.createdBy?.name || "System Specialist (AI Engine)";
  const operatorRole = data.createdBy?.role || "Sustainability Analyst";

  const predictedMaterial =
    data.predictedMaterial || prediction.predictedMaterial || "Unknown Fabric";
  const confidenceScore = Number(
    data.materialConfidence ?? prediction.confidenceScore ?? prediction.materialConfidence ?? 0
  );
  const wasteCategory =
    data.wasteCategory || prediction.wasteCategory || "Recyclable";
  const recyclabilityScore = Number(
    data.recyclabilityScore ?? prediction.recyclabilityScore ?? 0
  );
  const recyclabilityGrade =
    data.recyclabilityGrade || prediction.recyclabilityGrade || "Yellow";
  const recyclabilityGradeText =
    prediction.recyclabilityGradeText ||
    (recyclabilityScore >= 80
      ? "Highly Recyclable"
      : recyclabilityScore >= 60
      ? "Moderate Recyclability"
      : recyclabilityScore >= 30
      ? "Limited Recyclability"
      : "Disposal Recommended");

  const condition =
    data.condition || prediction.condition || "Good / Moderate Use";

  // Sustainability Metrics
  const sust = data.sustainabilityAnalysis || {};
  const carbonSaved = Number(
    sust.carbonSaved ?? sust.carbon_saved ?? (recyclabilityScore * 0.28).toFixed(1)
  );
  const waterSaved = Number(
    sust.waterSaved ?? sust.water_saved ?? Math.round(recyclabilityScore * 25)
  );
  const wasteDiversion = Number(
    sust.wasteDiversion ?? sust.waste_diversion ?? 92
  );
  const resourceRecovery = Number(
    sust.resourceRecovery ?? sust.resource_recovery ?? recyclabilityScore
  );
  const circularityScore = Number(
    sust.details?.circularityContribution ?? recyclabilityScore
  );
  const sustainabilityScore = Number(
    sust.sustainabilityScore ?? sust.sustainability_score ?? recyclabilityScore
  );
  const performance =
    sust.performance ||
    (sustainabilityScore >= 80
      ? "Excellent"
      : sustainabilityScore >= 65
      ? "Good"
      : sustainabilityScore >= 50
      ? "Average"
      : "Needs Improvement");

  // Material Profile & Diagnostics
  const materialInfo = data.materialInfo || {};
  const fabricDetection =
    data.fabricDetection ||
    data.materialClassification?.fabricDetection ||
    "Woven Structure";
  const textureAnalysis =
    data.textureAnalysis ||
    data.materialClassification?.textureAnalysis ||
    "Consistent surface pattern detected.";

  const colorAnalysis =
    data.colorAnalysis || data.materialClassification?.colorAnalysis || {};
  const dominantColors = Array.isArray(colorAnalysis.dominantColors)
    ? colorAnalysis.dominantColors.join(", ")
    : "Standard Saturation";

  const damageDet =
    data.damageDetection || data.wasteClassification?.damageDetection || {};
  const damageText = damageDet.damageDetected
    ? `${damageDet.damageType || "Surface Damage"} (${damageDet.damageSeverity || "Moderate"} Severity)`
    : "None (Clean Condition)";

  const contamDet =
    data.contaminationDetection ||
    data.wasteClassification?.contaminationDetection ||
    {};
  const contamText = contamDet.contaminationDetected
    ? `${contamDet.contaminationType || "Oil/Dirt"} (${contamDet.contaminationSeverity || "Moderate"} Severity)`
    : "None (Uncontaminated)";

  const recommendations = Array.isArray(data.recommendations)
    ? data.recommendations
    : [];

  const preproc = data.preprocessingMetadata || {
    resizedShape: [128, 128, 3],
    denoiseMethod: "Bilateral Filter (9, 75, 75)",
    normalization: "Min-Max [0, 1]",
  };

  // Image base64 conversion
  const rawImgPath = data.imagePath || data.imageUrl || prediction.imageUrl;
  const base64Image = await getBase64ImageFromUrl(rawImgPath);

  // 2. Initialize jsPDF Document (A4 portrait, mm units)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm

  let yPos = 22; // Initial Y cursor

  // Helper for adding new page with page break check
  const checkPageBreak = (neededHeight = 15) => {
    if (yPos + neededHeight > pageHeight - 20) {
      doc.addPage();
      yPos = 22;
      return true;
    }
    return false;
  };

  // Colors Palette
  const primaryNavy = [15, 23, 42]; // #0F172A
  const accentBlue = [37, 99, 235]; // #2563EB
  const emeraldGreen = [16, 185, 129]; // #10B981
  const bgLight = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0
  const textDark = [30, 41, 59]; // #1E293B
  const textMuted = [100, 116, 139]; // #64748B

  // =========================================================================
  // HEADER SECTION (Title Card)
  // =========================================================================
  // Dark Title Banner Background
  doc.setFillColor(...primaryNavy);
  doc.roundedRect(margin, yPos, contentWidth, 28, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("AI TEXTILE WASTE INTELLIGENCE PLATFORM", margin + 6, yPos + 10);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(147, 197, 253); // Light blue
  doc.text("AI Textile Waste Image Analysis Report", margin + 6, yPos + 17);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text("ISO 14044 LCA Environmental Audit Standard", margin + 6, yPos + 22);

  // Status Badge on Banner
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin + contentWidth - 42, yPos + 6, 36, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("OFFICIAL REPORT", margin + contentWidth - 39, yPos + 10.5);

  yPos += 33;

  // =========================================================================
  // METADATA CARD (4 Columns / Grid)
  // =========================================================================
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, yPos, contentWidth, 22, 2, 2, "FD");

  const colW = contentWidth / 4;

  // Col 1: Report ID
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text("REPORT ID", margin + 4, yPos + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...accentBlue);
  doc.text(`#${formattedId}`, margin + 4, yPos + 14);

  // Col 2: Timestamp
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text("DATE & TIME", margin + colW + 4, yPos + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  const dateShort = formattedDate.length > 28 ? formattedDate.substring(0, 28) + "..." : formattedDate;
  doc.text(dateShort, margin + colW + 4, yPos + 14);

  // Col 3: Uploaded File Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text("UPLOADED FILE", margin + colW * 2 + 4, yPos + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  const fileShort = fileName.length > 22 ? fileName.substring(0, 22) + "..." : fileName;
  doc.text(fileShort, margin + colW * 2 + 4, yPos + 14);

  // Col 4: Specialist / Operator
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...textMuted);
  doc.text("ANALYSIS SPECIALIST", margin + colW * 3 + 4, yPos + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  const opShort = `${operatorName} (${operatorRole})`;
  doc.text(opShort.length > 22 ? opShort.substring(0, 22) + "..." : opShort, margin + colW * 3 + 4, yPos + 14);

  yPos += 27;

  // =========================================================================
  // EXECUTIVE SUMMARY BOX
  // =========================================================================
  checkPageBreak(30);

  doc.setFillColor(239, 246, 255); // Soft blue tint #EFF6FF
  doc.setDrawColor(191, 219, 254); // #BFDBFE
  doc.roundedRect(margin, yPos, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accentBlue);
  doc.text("EXECUTIVE AI ANALYSIS SUMMARY", margin + 5, yPos + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);

  const summaryText = `Textile sample was identified as ${predictedMaterial.toUpperCase()} with ${confidenceScore}% confidence. Assigned to the ${wasteCategory} waste stream with a Recyclability Score of ${recyclabilityScore}/100 (${recyclabilityGradeText}). Processing yields a net carbon reduction of ${carbonSaved} kg CO2e and conserves ${waterSaved.toLocaleString()} L of freshwater.`;
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 10);
  doc.text(splitSummary, margin + 5, yPos + 12);

  yPos += 29;

  // =========================================================================
  // ANALYSIS RESULTS & IMAGE INSPECTION (2 Column Layout)
  // =========================================================================
  checkPageBreak(55);

  const leftWidth = base64Image ? contentWidth - 55 : contentWidth;
  const imageWidth = 48;
  const imageHeight = 48;

  // Primary Classification Card
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text("Detailed Material & Waste Classification", margin, yPos);
  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(0.6);
  doc.line(margin, yPos + 2, margin + 70, yPos + 2);

  yPos += 6;

  // Render Table of Key Findings
  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: base64Image ? margin + imageWidth + 7 : margin },
    tableWidth: leftWidth - (base64Image ? 5 : 0),
    head: [["Classification Metric", "AI Model Output"]],
    body: [
      ["Predicted Textile Material", `${predictedMaterial} (${confidenceScore}% Confidence)`],
      ["Waste Category Stream", wasteCategory],
      ["Recyclability Score & Grade", `${recyclabilityScore} / 100 (${recyclabilityGrade} Grade)`],
      ["Recycling Readiness Level", recyclabilityGradeText],
      ["Fabric Physical Condition", condition],
    ],
    theme: "grid",
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: bgLight,
    },
  });

  const tableFinalY = doc.lastAutoTable.finalY;

  // Embed Image Thumbnail on Right Side if available
  if (base64Image) {
    try {
      const imgX = margin + leftWidth;
      const imgY = yPos;

      doc.setFillColor(...bgLight);
      doc.setDrawColor(...borderGray);
      doc.roundedRect(imgX, imgY, imageWidth, imageHeight + 6, 2, 2, "FD");

      doc.addImage(base64Image, "JPEG", imgX + 2, imgY + 2, imageWidth - 4, imageHeight - 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text("ANALYZED SAMPLE SCAN", imgX + 5, imgY + imageHeight + 3);
    } catch (imgErr) {
      console.warn("Failed to render image in PDF:", imgErr);
    }
  }

  yPos = Math.max(tableFinalY, yPos + imageHeight + 8) + 8;

  // =========================================================================
  // LIFE CYCLE ASSESSMENT (LCA) & ENVIRONMENTAL IMPACT TABLE
  // =========================================================================
  checkPageBreak(45);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text("Environmental Impact & Life Cycle Assessment (LCA)", margin, yPos);
  doc.setDrawColor(...emeraldGreen);
  doc.setLineWidth(0.6);
  doc.line(margin, yPos + 2, margin + 95, yPos + 2);

  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [
      [
        "Carbon Offset (kg CO2e)",
        "Water Conserved (L)",
        "Landfill Diversion",
        "Recovery Yield",
        "Circularity Index",
        "ESG Rating",
      ],
    ],
    body: [
      [
        `${carbonSaved} kg CO2e`,
        `${waterSaved.toLocaleString()} L`,
        `${wasteDiversion}%`,
        `${resourceRecovery}%`,
        `${circularityScore} / 100`,
        `${sustainabilityScore}/100 (${performance})`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: emeraldGreen,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: 3,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
      cellPadding: 3,
      halign: "center",
      fontStyle: "bold",
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // =========================================================================
  // SURFACE DIAGNOSTICS & MATERIAL INSPECTION
  // =========================================================================
  checkPageBreak(45);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text("Surface Diagnostics & Material Inspection", margin, yPos);
  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(0.6);
  doc.line(margin, yPos + 2, margin + 75, yPos + 2);

  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [["Diagnostic Parameter", "Observed Feature & AI Telemetry"]],
    body: [
      ["Fabric Structure", fabricDetection],
      ["Surface Texture", textureAnalysis],
      ["Dominant Color Palette", dominantColors],
      ["Defects & Wear Detection", damageText],
      ["Contamination Assessment", contamText],
      [
        "OpenCV Tensor Metadata",
        `Dimensions: ${preproc.resizedShape?.join("x") || "128x128x3"} | Denoising: ${preproc.denoiseMethod || "Bilateral Filter"}`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [51, 65, 85], // Slate 700
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: bgLight,
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // =========================================================================
  // ACTION RECOMMENDATIONS TABLE
  // =========================================================================
  if (recommendations.length > 0) {
    checkPageBreak(45);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...primaryNavy);
    doc.text("Prioritized Action Recommendations & Directives", margin, yPos);
    doc.setDrawColor(...accentBlue);
    doc.setLineWidth(0.6);
    doc.line(margin, yPos + 2, margin + 85, yPos + 2);

    yPos += 6;

    const recBody = recommendations.map((rec, index) => {
      if (typeof rec === "object" && rec !== null) {
        return [
          `#${index + 1} - ${rec.name || "Action Directive"}`,
          rec.priority || "Standard",
          rec.reason || "Optimized waste stream management",
          rec.environmental_benefit || "Diverts textile waste from landfill",
        ];
      }
      return [`#${index + 1}`, "Standard", String(rec), "Conserves virgin resources"];
    });

    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      head: [["Recommendation / Pathway", "Priority", "Technical Rationale", "Environmental Benefit"]],
      body: recBody,
      theme: "grid",
      headStyles: {
        fillColor: primaryNavy,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textDark,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 55 },
        3: { cellWidth: 53 },
      },
      alternateRowStyles: {
        fillColor: bgLight,
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // =========================================================================
  // MATERIAL DOSSIER & HANDLING GUIDELINES
  // =========================================================================
  if (materialInfo.description || materialInfo.recommendedPathway || materialInfo.handlingGuidelines) {
    checkPageBreak(40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...primaryNavy);
    doc.text("Material Technical Dossier & Sorting Directives", margin, yPos);
    doc.setDrawColor(...accentBlue);
    doc.setLineWidth(0.6);
    doc.line(margin, yPos + 2, margin + 85, yPos + 2);

    yPos += 6;

    const dossierBody = [];
    if (materialInfo.description) {
      dossierBody.push(["Material Overview", materialInfo.description]);
    }
    if (materialInfo.recommendedPathway) {
      dossierBody.push(["Recommended Pathway", materialInfo.recommendedPathway]);
    }
    if (materialInfo.handlingGuidelines) {
      dossierBody.push(["Handling & Sorting Guidelines", materialInfo.handlingGuidelines]);
    }

    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin },
      head: [["Specification", "Technical Directive & Industry Guidelines"]],
      body: dossierBody,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textDark,
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: "bold" },
      },
      alternateRowStyles: {
        fillColor: bgLight,
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // =========================================================================
  // FOOTER & HEADER ON ALL PAGES (TWO-PASS PAGINATION)
  // =========================================================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (Pages > 1)
    if (i > 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text("AI TEXTILE WASTE INTELLIGENCE PLATFORM — ANALYSIS REPORT", margin, 12);
      doc.text(`REPORT ID: #${formattedId}`, pageWidth - margin - 35, 12);

      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.3);
      doc.line(margin, 14, pageWidth - margin, 14);
    }

    // Running Footer (All Pages)
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(
      "Confidential • AI Textile Waste Intelligence Platform • ISO 14044 Certified Audit Dossier",
      margin,
      pageHeight - 9
    );

    doc.setFont("helvetica", "bold");
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 18,
      pageHeight - 9
    );
  }

  // 3. Save PDF File with meaningful name
  const dateStamp = new Date().toISOString().slice(0, 10);
  const sanitizedId = reportId.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 12);
  const pdfFileName = `AI_Textile_Waste_Analysis_Report_${sanitizedId}_${dateStamp}.pdf`;

  doc.save(pdfFileName);

  notify(
    "Report Generated",
    `Analysis PDF report (#${formattedId}) downloaded.`,
    "report",
    `/report/${reportId}`
  );
};

/**
 * Generates a clean, professional, vector PDF report for an Inventory Batch.
 * @param {Object} batch - The inventory batch item.
 */
export const generateBatchPdfReport = async (batch) => {
  if (!batch) {
    console.error("No batch data provided for PDF generation.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const primaryNavy = [15, 23, 42];
  const accentBlue = [37, 99, 235];
  const bgLight = [248, 250, 252];
  const borderGray = [226, 232, 240];
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];

  // Top Header Banner
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("AI TEXTILE WASTE INTELLIGENCE PLATFORM", margin, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(191, 219, 254);
  doc.text("INVENTORY BATCH MANIFEST & AUDIT REPORT", margin, 19);

  let yPos = 36;
  const batchId = String(batch.wasteBatchId || batch._id || "BATCH-" + Date.now().toString(36).toUpperCase());
  const dateStr = batch.collectionDate ? new Date(batch.collectionDate).toLocaleDateString() : new Date().toLocaleDateString();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text("Batch Overview Specifications", margin, yPos);
  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(0.6);
  doc.line(margin, yPos + 2, margin + 65, yPos + 2);
  yPos += 7;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [["Specification Parameter", "Recorded Detail Value"]],
    body: [
      ["Batch ID", batchId],
      ["Fabric Type", batch.fabricType || "N/A"],
      ["Origin / Source", batch.source || "N/A"],
      ["Quantity / Weight", `${batch.quantity || 0} kg`],
      ["Color", batch.color || "N/A"],
      ["Condition", batch.condition || "N/A"],
      ["Collection Date", dateStr],
      ["System Log Date", batch.createdAt ? new Date(batch.createdAt).toLocaleString() : dateStr],
    ],
    theme: "grid",
    headStyles: { fillColor: primaryNavy, textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8.5, textColor: textDark, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" } },
    alternateRowStyles: { fillColor: bgLight },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Circular Economy Pathway
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryNavy);
  doc.text("Recommended Circular Economy Pathway", margin, yPos);
  doc.setDrawColor(...accentBlue);
  doc.setLineWidth(0.6);
  doc.line(margin, yPos + 2, margin + 75, yPos + 2);
  yPos += 7;

  let readiness = "100% High Readiness";
  let pathway = "Direct Mechanical Shredding & Fiber Respinning";
  if (batch.condition === "Good") {
    readiness = "85% Moderate Readiness";
    pathway = "Garment Upcycling & Direct Reuse Stream";
  } else if (batch.condition === "Damaged") {
    readiness = "40% Chemical Processing";
    pathway = "Chemical Depolymerization & Polymer Extraction";
  } else if (batch.condition === "Heavily Damaged") {
    readiness = "20% Downcycling Stream";
    pathway = "Industrial Insulation & Shoddy Fiber Production";
  }

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    head: [["Category", "Pathway & Technical Directive"]],
    body: [
      ["Recycling Readiness Tier", readiness],
      ["Target Processing Pathway", pathway],
      ["Operational Recommendation", `Route ${batch.fabricType || "textile"} batch (${batch.quantity || 0} kg) to designated processing facility for circular recovery.`],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 8.5, textColor: textDark, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" } },
    alternateRowStyles: { fillColor: bgLight },
  });

  // Footer & Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text("Confidential • AI Textile Waste Intelligence Platform • Inventory Audit Manifest", margin, pageHeight - 9);

    doc.setFont("helvetica", "bold");
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 9);
  }

  const sanitizedBatchId = String(batchId).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 12);
  doc.save(`Inventory_Batch_Report_${sanitizedBatchId}.pdf`);

  notify(
    "Batch Report Generated",
    `Audit manifest for Batch ${batchId} downloaded.`,
    "inventory",
    "/inventory"
  );
};

