import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/history");
        if (res.data && res.data.success) {
          setHistory(res.data.data || []);
        } else {
          setError("Failed to load classification history.");
        }
      } catch (err) {
        console.error("Fetch History Error:", err);
        setError("Could not load prediction history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) =>
    (item.predictedMaterial || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.originalName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.wasteCategory || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Classification & Prediction History
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Historical archive of past textile waste image predictions and circular economy assessments
            </p>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by material or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600 mt-4">Loading prediction records...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No classification records found.</p>
            <Link
              to="/analysis"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition"
            >
              Analyze First Textile Image
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Image</th>
                    <th className="py-3.5 px-4">Filename</th>
                    <th className="py-3.5 px-4">Predicted Material</th>
                    <th className="py-3.5 px-4">Confidence</th>
                    <th className="py-3.5 px-4">Waste Category</th>
                    <th className="py-3.5 px-4">Recyclability</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <img
                          src={item.imagePath || "/placeholder.png"}
                          alt={item.predictedMaterial}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.originalName || "Textile Sample"}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.predictedMaterial}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {item.materialConfidence}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.wasteCategory}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.recyclabilityGrade === "Green"
                              ? "bg-green-100 text-green-800"
                              : item.recyclabilityGrade === "Yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.recyclabilityGrade === "Orange"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.recyclabilityScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/report/${item._id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HistoryPage;
