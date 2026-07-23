import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/classification");

      if (response.data.success) {
        const historyData = response.data.data;
        setHistory(historyData);

        // Aggregate statistics locally from classification history
        const total = historyData.length;
        let sumScore = 0;
        const materialDistribution = {};
        const wasteDistribution = {};
        const gradeDistribution = {};

        historyData.forEach((item) => {
          sumScore += item.recyclabilityScore || 0;

          const mat = item.predictedMaterial || "Unknown";
          materialDistribution[mat] = (materialDistribution[mat] || 0) + 1;

          const waste = item.wasteCategory || "Unknown";
          wasteDistribution[waste] = (wasteDistribution[waste] || 0) + 1;

          const grade = item.recyclabilityGrade || "Unknown";
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        });

        const avg = total > 0 ? Math.round(sumScore / total) : 0;

        setStats({
          totalAnalysed: total,
          avgScore: avg,
          materialDistribution,
          wasteDistribution,
          gradeDistribution,
        });
      } else {
        throw new Error(response.data.message || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load analytics dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">
              Aggregating circular intelligence statistics...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition"
            >
              Retry Connection
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback defaults if no statistics exist yet
  const totalAnalysed = stats?.totalAnalysed || 0;
  const avgScore = stats?.avgScore || 0;
  const materialDist = stats?.materialDistribution || {};
  const wasteDist = stats?.wasteDistribution || {};
  const gradeDist = stats?.gradeDistribution || {};

  // 1. Material Chart Data
  const materialLabels = Object.keys(materialDist);
  const materialCounts = Object.values(materialDist);
  const materialChartData = {
    labels: materialLabels.length > 0 ? materialLabels : ["No Data Available"],
    datasets: [
      {
        label: "Image Count",
        data: materialCounts.length > 0 ? materialCounts : [0],
        backgroundColor: [
          "rgba(37, 99, 235, 0.75)", // Blue
          "rgba(139, 92, 246, 0.75)", // Purple
          "rgba(245, 158, 11, 0.75)", // Amber
          "rgba(236, 72, 153, 0.75)", // Pink
          "rgba(16, 185, 129, 0.75)", // Emerald
          "rgba(79, 70, 229, 0.75)", // Indigo
          "rgba(6, 182, 212, 0.75)", // Cyan
          "rgba(20, 184, 166, 0.75)", // Teal
          "rgba(244, 63, 94, 0.75)", // Rose
          "rgba(100, 116, 139, 0.75)", // Slate
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // 2. Waste Category Chart Data
  const wasteLabels = Object.keys(wasteDist);
  const wasteCounts = Object.values(wasteDist);
  const wasteChartData = {
    labels: wasteLabels.length > 0 ? wasteLabels : ["No Data Available"],
    datasets: [
      {
        data: wasteCounts.length > 0 ? wasteCounts : [1],
        backgroundColor: [
          "#10B981", // Emerald (Recyclable)
          "#3B82F6", // Blue (Reusable)
          "#F59E0B", // Amber (Repairable)
          "#8B5CF6", // Purple (Upcyclable)
          "#14B8A6", // Teal (Compostable)
          "#EF4444", // Red (Hazardous)
        ],
        hoverOffset: 4,
      },
    ],
  };

  // Helper function to return colour grade styles
  const getGradeStyle = (grade) => {
    switch (grade) {
      case "Green":
        return "bg-green-100 text-green-800 border-green-200";
      case "Yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Orange":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Red":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title / Banner */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              AI Analytics & Circular Intelligence
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Real-time material distribution, waste streams tracking, and recyclability index grading
          </p>
        </div>

        {/* Aggregated Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Samples Analysed
            </span>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">{totalAnalysed}</span>
              <span className="text-xs font-medium text-slate-500">All Fibers</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Recyclability
            </span>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-black text-blue-600">{avgScore}%</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  avgScore >= 80
                    ? "bg-green-100 text-green-700"
                    : avgScore >= 60
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {avgScore >= 80 ? "High" : avgScore >= 60 ? "Moderate" : "Low"}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Highest Material Stream
            </span>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-800 truncate max-w-[150px]">
                {materialLabels.length > 0
                  ? materialLabels[materialCounts.indexOf(Math.max(...materialCounts))]
                  : "N/A"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Max Vol: {materialCounts.length > 0 ? Math.max(...materialCounts) : 0}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Primary Waste Stream
            </span>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-800 truncate max-w-[150px]">
                {wasteLabels.length > 0
                  ? wasteLabels[wasteCounts.indexOf(Math.max(...wasteCounts))]
                  : "N/A"}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Max Vol: {wasteCounts.length > 0 ? Math.max(...wasteCounts) : 0}
              </span>
            </div>
          </div>
        </div>

        {totalAnalysed === 0 ? (
          /* Empty State Display */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No AI Analyses Logged Yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Before visual charts can aggregate metrics, upload fabric samples to execute neural classification.
            </p>
            <Link
              to="/analysis"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition inline-block text-sm"
            >
              Analyze Your First Textile Image
            </Link>
          </div>
        ) : (
          /* Charts and Graphs section */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Material distribution bar chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Textile Material Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Aggregate volumes identified by neural fiber classification
                </p>
                <div className="h-[280px]">
                  <Bar
                    data={materialChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { precision: 0 },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Waste Category pie chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Circular Waste Categories
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Segmented streams based on recyclability grading
                </p>
                <div className="h-[280px] flex items-center justify-center">
                  <Doughnut
                    data={wasteChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Analyses Log table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent AI Analyses Log</h3>
                  <p className="text-xs text-slate-500">
                    Latest classification executions with detailed circular economy grades
                  </p>
                </div>
                <Link
                  to="/analysis"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  + Run New Image Analysis
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="px-6 py-3.5">Sample Image</th>
                      <th className="px-6 py-3.5">Material</th>
                      <th className="px-6 py-3.5">Confidence</th>
                      <th className="px-6 py-3.5">Waste Stream</th>
                      <th className="px-6 py-3.5">Recyclability</th>
                      <th className="px-6 py-3.5">Grade</th>
                      <th className="px-6 py-3.5">Analysis Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {history.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            <img
                              src={
                                item.imagePath.startsWith("http")
                                  ? item.imagePath
                                  : `http://localhost:5000${item.imagePath}`
                              }
                              alt={item.predictedMaterial}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {item.predictedMaterial}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {item.materialConfidence}%
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                            {item.wasteCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-850">
                              {item.recyclabilityScore}%
                            </span>
                            <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${item.recyclabilityScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getGradeStyle(
                              item.recyclabilityGrade
                            )}`}
                          >
                            {item.recyclabilityGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/report/${item._id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-slate-350 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs transition"
                          >
                            View Report
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
