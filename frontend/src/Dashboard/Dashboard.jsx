import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import { useAuth } from "../Authentication/AuthContext";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import ErrorBoundary from "../Shared/ErrorBoundary";
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
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Sustainability Manager");

  useEffect(() => {
    if (user?.role) {
      if (user.role === "Admin") setActiveTab("Administrator");
      else if (user.role.toLowerCase().includes("facility") || user.role.toLowerCase().includes("recycl")) setActiveTab("Recycling Facility");
      else if (user.role.toLowerCase().includes("manufactur")) setActiveTab("Manufacturer");
      else setActiveTab("Sustainability Manager");
    }
  }, [user]);

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
        let sumCarbon = 0;
        let sumWater = 0;
        let sumDiversion = 0;
        let sumRecovery = 0;
        let sumCircularity = 0;

        const materialDistribution = {};
        const wasteDistribution = {};
        const gradeDistribution = {};
        const carbonByMaterial = {};
        const scoreRanges = { Excellent: 0, Good: 0, Average: 0, "Needs Improvement": 0 };
        const recCounts = {};

        historyData.forEach((item) => {
          const score = item.sustainabilityAnalysis?.sustainabilityScore || item.recyclabilityScore || 0;
          sumScore += score;

          const carbon = Number(item.sustainabilityAnalysis?.carbonSaved || item.sustainabilityAnalysis?.carbon_saved || 0);
          const water = Number(item.sustainabilityAnalysis?.waterSaved || item.sustainabilityAnalysis?.water_saved || 0);
          const diversion = Number(item.sustainabilityAnalysis?.wasteDiversion || item.sustainabilityAnalysis?.waste_diversion || 0);
          const recovery = Number(item.sustainabilityAnalysis?.resourceRecovery || item.sustainabilityAnalysis?.resource_recovery || 0);
          const circularity = Number(item.sustainabilityAnalysis?.details?.circularityContribution || item.sustainabilityAnalysis?.sustainabilityScore || 0);

          sumCarbon += carbon;
          sumWater += water;
          sumDiversion += diversion;
          sumRecovery += recovery;
          sumCircularity += circularity;

          const mat = item.predictedMaterial || "Unknown";
          materialDistribution[mat] = (materialDistribution[mat] || 0) + 1;
          carbonByMaterial[mat] = (carbonByMaterial[mat] || 0) + carbon;

          const waste = item.wasteCategory || "Unknown";
          wasteDistribution[waste] = (wasteDistribution[waste] || 0) + 1;

          const grade = item.recyclabilityGrade || "Unknown";
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

          if (score >= 80) scoreRanges.Excellent++;
          else if (score >= 65) scoreRanges.Good++;
          else if (score >= 50) scoreRanges.Average++;
          else scoreRanges["Needs Improvement"]++;

          const recs = item.sustainabilityAnalysis?.recommendations || item.recommendations || [];
          recs.forEach((rec) => {
            const recName = typeof rec === "object" ? rec.name : String(rec);
            recCounts[recName] = (recCounts[recName] || 0) + 1;
          });
        });

        const avg = total > 0 ? Math.round(sumScore / total) : 0;
        const avgDiversion = total > 0 ? Math.round(sumDiversion / total) : 0;
        const avgRecovery = total > 0 ? Math.round(sumRecovery / total) : 0;
        const avgCircularity = total > 0 ? Math.round(sumCircularity / total) : 0;

        setStats({
          totalAnalysed: total,
          avgScore: avg,
          avgCircularity,
          totalCarbon: parseFloat(sumCarbon.toFixed(1)),
          totalWater: Math.round(sumWater),
          avgDiversion,
          avgRecovery,
          materialDistribution,
          wasteDistribution,
          gradeDistribution,
          carbonByMaterial,
          scoreRanges,
          recCounts,
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

    const handleHistoryUpdate = () => {
      fetchData();
    };

    window.addEventListener("history-updated", handleHistoryUpdate);
    return () => {
      window.removeEventListener("history-updated", handleHistoryUpdate);
    };
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
  const avgCircularity = stats?.avgCircularity || 0;
  const materialDist = stats?.materialDistribution || {};
  const wasteDist = stats?.wasteDistribution || {};
  const carbonByMat = stats?.carbonByMaterial || {};
  const scoreRanges = stats?.scoreRanges || { Excellent: 0, Good: 0, Average: 0, "Needs Improvement": 0 };
  const recCounts = stats?.recCounts || {};

  // 1. Material Distribution Chart Data
  const materialLabels = Object.keys(materialDist);
  const materialCounts = Object.values(materialDist);
  const materialChartData = {
    labels: materialLabels.length > 0 ? materialLabels : ["No Data"],
    datasets: [
      {
        label: "Sample Count",
        data: materialCounts.length > 0 ? materialCounts : [0],
        backgroundColor: [
          "#3B82F6", // Blue
          "#10B981", // Green
          "#F59E0B", // Orange
          "#8B5CF6", // Purple
          "#EC4899", // Pink
          "#06B6D4", // Cyan
          "#14B8A6", // Teal
          "#6366F1", // Indigo
        ],
        borderRadius: 8,
      },
    ],
  };

  // 2. Waste Category Chart Data
  const wasteLabels = Object.keys(wasteDist);
  const wasteCounts = Object.values(wasteDist);
  const wasteChartData = {
    labels: wasteLabels.length > 0 ? wasteLabels : ["No Data"],
    datasets: [
      {
        data: wasteCounts.length > 0 ? wasteCounts : [1],
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#EF4444", "#06B6D4"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // 3. Carbon Savings by Fiber Chart Data
  const carbonLabels = Object.keys(carbonByMat);
  const carbonValues = Object.values(carbonByMat);
  const carbonChartData = {
    labels: carbonLabels.length > 0 ? carbonLabels : ["No Data"],
    datasets: [
      {
        label: "CO₂ Saved (kg)",
        data: carbonValues.length > 0 ? carbonValues : [0],
        backgroundColor: [
          "#10B981", // Green
          "#059669",
          "#14B8A6", // Teal
          "#06B6D4", // Cyan
          "#3B82F6", // Blue
        ],
        borderRadius: 8,
      },
    ],
  };

  // 4. Score Distribution Chart Data (Tier-Based Colors)
  const scoreChartData = {
    labels: Object.keys(scoreRanges),
    datasets: [
      {
        label: "Samples",
        data: Object.values(scoreRanges),
        backgroundColor: [
          "#10B981", // Excellent (Green)
          "#3B82F6", // Good (Blue)
          "#F59E0B", // Average (Orange)
          "#EF4444", // Needs Improvement (Red)
        ],
        borderRadius: 8,
      },
    ],
  };

  // 5. Recycling Recommendation Distribution Chart Data
  const recLabels = Object.keys(recCounts);
  const recValues = Object.values(recCounts);
  const recChartData = {
    labels: recLabels.length > 0 ? recLabels : ["No Data"],
    datasets: [
      {
        data: recValues.length > 0 ? recValues : [1],
        backgroundColor: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#EF4444"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Helper function to return colour grade styles
  const getGradeStyle = (grade) => {
    switch (grade) {
      case "Green":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
      case "Yellow":
        return "bg-amber-50 text-amber-700 border-amber-200/70";
      case "Orange":
        return "bg-orange-50 text-orange-700 border-orange-200/70";
      case "Red":
        return "bg-red-50 text-red-700 border-red-200/70";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/70";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-12 space-y-10">
        {/* Header / Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Analytics & Circular Intelligence Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time material distribution, waste stream tracking, LCA environmental impact & circular benchmarking
            </p>
          </div>
          <Link
            to="/analysis"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-2xs flex items-center justify-center space-x-2 shrink-0"
          >
            <span>+ New AI Analysis</span>
          </Link>
        </div>

        {/* SECTION 1: Key Sustainability Metrics */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Key Sustainability Metrics
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-200/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Sustainability Score</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/80 text-blue-800 border border-blue-200">Weighted</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-blue-600 tabular-nums">{avgScore}</p>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1.5 border-t border-blue-100/60">Multi-parameter circular index</p>
            </div>

            <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Circularity Contribution</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100/80 text-indigo-800 border border-indigo-200">Index</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-indigo-600 tabular-nums">{avgCircularity}</p>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1.5 border-t border-indigo-100/60">Circular economy contribution rate</p>
            </div>

            <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Resource Recovery Yield</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200">Yield</span>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-emerald-600 tabular-nums">{stats?.avgRecovery || 0}%</p>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1.5 border-t border-emerald-100/60">Raw fiber recovery efficiency</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Environmental Impact (Light Premium Sustainability Style with Pastel Tints) */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Environmental Impact Assessment
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-2 relative overflow-hidden">
              <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0"></div>
              <div className="flex items-center justify-between pl-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Carbon Footprint Saved</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-xs font-bold">🌱</span>
              </div>
              <div className="flex items-baseline space-x-1.5 pl-1">
                <p className="text-3xl font-black text-slate-900 tabular-nums">{stats?.totalCarbon || 0}</p>
                <span className="text-xs font-bold text-emerald-600">kg CO₂e</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1.5 border-t border-emerald-200/50 pl-1">Avoided virgin manufacturing emissions</p>
            </div>

            <div className="bg-cyan-50/50 p-5 rounded-2xl border border-cyan-200/80 shadow-2xs space-y-2 relative overflow-hidden">
              <div className="w-1.5 h-full bg-cyan-500 absolute left-0 top-0"></div>
              <div className="flex items-center justify-between pl-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">Water Conserved</span>
                <span className="w-6 h-6 rounded-full bg-cyan-100/80 text-cyan-700 flex items-center justify-center text-xs font-bold">💧</span>
              </div>
              <div className="flex items-baseline space-x-1.5 pl-1">
                <p className="text-3xl font-black text-slate-900 tabular-nums">{stats?.totalWater ? stats.totalWater.toLocaleString() : 0}</p>
                <span className="text-xs font-bold text-cyan-600">L</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1.5 border-t border-cyan-200/50 pl-1">Freshwater saved in processing</p>
            </div>

            <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-200/80 shadow-2xs space-y-2 relative overflow-hidden">
              <div className="w-1.5 h-full bg-teal-500 absolute left-0 top-0"></div>
              <div className="flex items-center justify-between pl-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700">Landfill Reduction</span>
                <span className="w-6 h-6 rounded-full bg-teal-100/80 text-teal-700 flex items-center justify-center text-xs font-bold">♻️</span>
              </div>
              <div className="flex items-baseline space-x-1.5 pl-1">
                <p className="text-3xl font-black text-slate-900 tabular-nums">{stats?.avgDiversion || 0}%</p>
                <span className="text-xs font-bold text-teal-600">Diverted</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1.5 border-t border-teal-200/50 pl-1">Landfill avoidance efficiency rate</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Role-Based Intelligence Control Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Role-Based Intelligence Perspective</h3>
              <p className="text-xs text-slate-500 mt-0.5">Switch view perspective or open full standalone dashboard page</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
              {[
                { name: "Sustainability Manager", path: "/dashboard/sustainability" },
                { name: "Recycling Facility", path: "/dashboard/recycling" },
                { name: "Manufacturer", path: "/dashboard/manufacturer" },
                { name: "Administrator", path: "/dashboard/admin" },
              ].map((tab) => (
                <div key={tab.name} className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                      activeTab === tab.name
                        ? "bg-white text-blue-600 shadow-2xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.name}
                  </button>
                  <Link
                    to={tab.path}
                    title={`Open full ${tab.name} Dashboard Page`}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1"
                  >
                    ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Role Tab Content Cards */}
          {activeTab === "Recycling Facility" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Waste Inventory</span>
                <p className="text-base font-black text-slate-900">{totalAnalysed} Fabric Batches</p>
                <p className="text-slate-600 leading-relaxed">Stream breakdown: {Object.keys(materialDist).join(", ") || "No material streams registered"}</p>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-1.5 text-blue-950">
                <span className="font-bold uppercase text-blue-700 text-[10px]">Recycling Opportunities</span>
                <p className="text-base font-black text-blue-900">{stats?.avgRecovery || 0}% High-Yield Candidates</p>
                <p className="text-blue-800 leading-relaxed">Prioritized sorting direct route to maximize fiber length retention.</p>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-1.5 text-emerald-950">
                <span className="font-bold uppercase text-emerald-700 text-[10px]">Recovery Statistics</span>
                <p className="text-base font-black text-emerald-900">{stats?.avgDiversion || 0}% Diverted from Landfill</p>
                <p className="text-emerald-800 leading-relaxed">Recovered fiber output replaces virgin material procurement.</p>
              </div>
            </div>
          )}

          {activeTab === "Sustainability Manager" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Sustainability Index</span>
                <p className="text-lg font-black text-slate-900">{avgScore} / 100</p>
                <p className="text-slate-500 text-[10px]">Corporate ESG Compliance</p>
              </div>

              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/80 space-y-1">
                <span className="font-bold uppercase text-emerald-700 text-[10px]">Carbon Reduction</span>
                <p className="text-lg font-black text-slate-900">{stats?.totalCarbon || 0} kg CO₂e</p>
                <p className="text-emerald-600 text-[10px]">Avoided Scope 3 Emissions</p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Waste Diversion</span>
                <p className="text-lg font-black text-slate-900">{stats?.avgDiversion || 0}%</p>
                <p className="text-slate-500 text-[10px]">Landfill Avoidance Yield</p>
              </div>

              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200/80 space-y-1 text-blue-950">
                <span className="font-bold uppercase text-blue-700 text-[10px]">ESG Summary</span>
                <p className="text-sm font-bold text-blue-900 mt-1">Audit Verified</p>
                <p className="text-blue-800 text-[10px]">Report audit log synchronized</p>
              </div>
            </div>
          )}

          {activeTab === "Manufacturer" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Production Waste Analysis</span>
                <p className="text-base font-black text-slate-900">{totalAnalysed} Production Offcut Batches</p>
                <p className="text-slate-600 leading-relaxed">Identified fiber streams for closed-loop textile manufacturing.</p>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-1.5 text-emerald-950">
                <span className="font-bold uppercase text-emerald-700 text-[10px]">Material Recovery Yield</span>
                <p className="text-base font-black text-emerald-900">{stats?.avgRecovery || 0}% Usable Raw Fiber</p>
                <p className="text-emerald-800 leading-relaxed">Raw fiber recovery yield suitable for blending into new yarn.</p>
              </div>

              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 space-y-1.5 text-indigo-950">
                <span className="font-bold uppercase text-indigo-700 text-[10px]">Circular Economy Insights</span>
                <p className="text-base font-black text-indigo-900">{avgCircularity} / 100 Index</p>
                <p className="text-indigo-800 leading-relaxed">Closed-loop manufacturing integration capability.</p>
              </div>
            </div>
          )}

          {activeTab === "Administrator" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Platform Analytics</span>
                <p className="text-base font-black text-slate-900">{totalAnalysed} Executions Logged</p>
                <p className="text-slate-600 leading-relaxed">Neural vision engine operations status: Active</p>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-1.5 text-blue-950">
                <span className="font-bold uppercase text-blue-700 text-[10px]">User Session</span>
                <p className="text-base font-black text-blue-900">{user?.role || "User"} Session</p>
                <p className="text-blue-800 leading-relaxed">Authenticated account: {user?.email || "User"}</p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Database Persistence</span>
                <p className="text-base font-black text-slate-900">{history.length} Reports Persisted</p>
                <p className="text-slate-600 leading-relaxed">MongoDB database state: Connected & Verified</p>
              </div>
            </div>
          )}
        </div>

        {totalAnalysed === 0 ? (
          /* Empty State Display */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No AI Analyses Logged Yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Before visual charts can aggregate metrics, upload fabric samples to execute neural classification.
            </p>
            <Link
              to="/analysis"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-2xs transition inline-block text-xs"
            >
              Analyze Your First Textile Image
            </Link>
          </div>
        ) : (
          /* SECTION 4: Primary & Secondary Analytics Charts */
          <div className="space-y-8">
            {/* Primary Charts Row: Material Distribution (Large Primary) & Waste Diversion (Supporting) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Material Distribution Bar Chart (Primary Large Chart) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Material Distribution
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Aggregate volume identified by neural fiber classification engine
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200/60">
                    Primary Stream
                  </span>
                </div>
                <div className="h-[300px]">
                  <Bar
                    data={materialChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          padding: 10,
                          titleFont: { family: "Inter", size: 12, weight: "700" },
                          bodyFont: { family: "Inter", size: 12 },
                        },
                      },
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          beginAtZero: true,
                          ticks: { precision: 0, font: { family: "Inter", size: 11 } },
                          grid: { color: "rgba(226, 232, 240, 0.6)" },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Waste Category Doughnut Chart (Supporting Chart) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Waste Diversion
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Segmented streams based on recyclability grading
                  </p>
                </div>
                <div className="h-[300px] flex items-center justify-center">
                  <Doughnut
                    data={wasteChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { boxWidth: 10, font: { family: "Inter", size: 11, weight: "600" }, padding: 12 },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Secondary Analytics Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Carbon Savings by Fiber */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Carbon Savings (CO₂e)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Emissions avoided by material stream</p>
                </div>
                <div className="h-[230px]">
                  <Bar
                    data={carbonChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          beginAtZero: true,
                          ticks: { font: { family: "Inter", size: 10 } },
                          grid: { color: "rgba(226, 232, 240, 0.6)" },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Sustainability Score Distribution */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sustainability Scores</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Performance tier breakdown</p>
                </div>
                <div className="h-[230px]">
                  <Bar
                    data={scoreChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          beginAtZero: true,
                          ticks: { precision: 0, font: { family: "Inter", size: 10 } },
                          grid: { color: "rgba(226, 232, 240, 0.6)" },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Recycling Recommendation Distribution */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recycling Directives</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Recommendation distribution</p>
                </div>
                <div className="h-[230px] flex items-center justify-center">
                  <Doughnut
                    data={recChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { boxWidth: 8, font: { family: "Inter", size: 10, weight: "600" }, padding: 8 },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: Recent AI Analyses Log (Matching History Page Styling) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent AI Analyses Log</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
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
                    <tr className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                      <th className="py-4 px-5">Sample</th>
                      <th className="py-4 px-5">Material</th>
                      <th className="py-4 px-5">Confidence</th>
                      <th className="py-4 px-5">Waste Stream</th>
                      <th className="py-4 px-5">Recyclability</th>
                      <th className="py-4 px-5">Grade</th>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5 text-right whitespace-nowrap min-w-[150px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {history.map((item, idx) => {
                      if (!item) return null;
                      const imageSrc =
                        item.imagePath && typeof item.imagePath === "string"
                          ? item.imagePath.startsWith("http")
                            ? item.imagePath
                            : `http://localhost:5000${item.imagePath}`
                          : "/placeholder.png";

                      const formattedDate = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "N/A";

                      const grade = item.recyclabilityGrade || "Green";

                      return (
                        <tr key={item._id || `history-${idx}`} className="hover:bg-slate-50/80 transition-colors duration-150">
                          <td className="py-4 px-5">
                            <img
                              src={imageSrc}
                              alt={item.predictedMaterial || "Textile Sample"}
                              className="w-11 h-11 object-cover rounded-xl border border-slate-200/80 shadow-2xs shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder.png";
                              }}
                            />
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900 text-sm tracking-tight">
                            {item.predictedMaterial || "Unknown"}
                          </td>
                          <td className="py-4 px-5">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 tabular-nums inline-block">
                              {item.materialConfidence || 0}%
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-700 font-medium text-xs sm:text-sm">
                            {item.wasteCategory || "Recyclable"}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-xs tabular-nums">
                                {item.recyclabilityScore || 0}%
                              </span>
                              <div className="w-14 h-2 bg-slate-100 border border-slate-200/60 rounded-full overflow-hidden shrink-0">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${item.recyclabilityScore || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border tabular-nums inline-block ${
                                grade === "Green"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                                  : grade === "Yellow"
                                  ? "bg-amber-50 text-amber-700 border-amber-200/70"
                                  : grade === "Orange"
                                  ? "bg-orange-50 text-orange-700 border-orange-200/70"
                                  : "bg-red-50 text-red-700 border-red-200/70"
                              }`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-500 font-medium tabular-nums whitespace-nowrap">
                            {formattedDate}
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap min-w-[150px] align-middle">
                            <Link
                              to={`/report/${item._id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100/80 text-blue-600 hover:text-blue-700 text-xs font-semibold whitespace-nowrap transition-colors duration-150 border border-blue-200/60 shadow-2xs group"
                            >
                              <svg className="w-3.5 h-3.5 text-blue-500 group-hover:scale-105 transition-transform duration-150 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>View Report</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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

const DashboardWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <Dashboard {...props} />
  </ErrorBoundary>
);

export default DashboardWithErrorBoundary;
