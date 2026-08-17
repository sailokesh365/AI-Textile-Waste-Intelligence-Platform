import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import { useAuth } from "../Authentication/AuthContext";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import InventoryModal from "./InventoryModal";
import { generateBatchPdfReport } from "../Analysis/utils/generatePdfReport";
import { notify } from "../Shared/NotificationContext";

const InventoryDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [prefillMaterial, setPrefillMaterial] = useState(null);

  // Batch Details Drawer state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (location.state?.fromAnalysis && location.state?.prefillMaterial) {
      setEditingItem(null);
      setPrefillMaterial(location.state.prefillMaterial);
      setIsModalOpen(true);
      // Clear history state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filters
  const [fabricFilter, setFabricFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (fabricFilter !== "All") params.fabricType = fabricFilter;
      if (conditionFilter !== "All") params.condition = conditionFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await axiosInstance.get("/inventory", { params });
      setInventories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch inventory records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();

    const handleHistoryUpdate = () => {
      fetchInventories();
    };

    window.addEventListener("history-updated", handleHistoryUpdate);
    return () => {
      window.removeEventListener("history-updated", handleHistoryUpdate);
    };
  }, [fabricFilter, conditionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventories();
  };

  const handleSaveInventory = async (itemData) => {
    if (editingItem) {
      await axiosInstance.put(`/inventory/${editingItem._id}`, itemData);
      notify(
        "Waste Batch Updated",
        `Batch ${itemData.wasteBatchId} was updated successfully.`,
        "inventory",
        "/inventory"
      );
    } else {
      await axiosInstance.post("/inventory", itemData);
      notify(
        "New Waste Batch Registered",
        `Batch ${itemData.wasteBatchId} (${itemData.quantity} kg ${itemData.fabricType}) registered.`,
        "inventory",
        "/inventory"
      );
    }
    fetchInventories();
  };

  const handleDeleteInventory = async (id, batchId) => {
    if (!window.confirm(`Are you sure you want to delete Batch ${batchId}?`)) {
      return;
    }
    try {
      await axiosInstance.delete(`/inventory/${id}`);
      setInventories((prev) => prev.filter((item) => item._id !== id));
      notify(
        "Waste Batch Deleted",
        `Batch ${batchId} was removed from inventory.`,
        "inventory",
        "/inventory"
      );
      if (selectedBatch?._id === id) {
        setIsDrawerOpen(false);
        setSelectedBatch(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item.");
    }
  };

  const handleRowClick = (item) => {
    setSelectedBatch(item);
    setIsDrawerOpen(true);
  };

  const totalQuantityKg = inventories.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0),
    0
  );

  const recyclableCount = inventories.filter(
    (item) => item.condition === "Recyclable" || item.condition === "Good"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Primary CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Textile Waste Inventory Management
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Log, track, and categorize post-industrial and post-consumer textile batches
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>+ Register Waste Batch</span>
          </button>
        </div>

        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Logged Batches
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {inventories.length}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Weight (KG)
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {totalQuantityKg.toLocaleString()} kg
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Recycling Readiness
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {inventories.length > 0
                ? `${Math.round((recyclableCount / inventories.length) * 100)}%`
                : "0%"}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Specialist
            </p>
            <p className="text-base font-bold text-slate-900 mt-2 truncate">
              {user?.name || "Verified Operator"}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full md:w-80 flex items-center"
          >
            <input
              type="text"
              placeholder="Search Batch ID, Source, or Color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-slate-900"
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Fabric:</span>
              <select
                value={fabricFilter}
                onChange={(e) => setFabricFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="All">All Fabrics</option>
                <option value="Cotton">Cotton</option>
                <option value="Polyester">Polyester</option>
                <option value="Wool">Wool</option>
                <option value="Silk">Silk</option>
                <option value="Linen">Linen</option>
                <option value="Denim">Denim</option>
                <option value="Nylon">Nylon</option>
                <option value="Rayon">Rayon</option>
                <option value="Acrylic">Acrylic</option>
                <option value="Mixed Fabrics">Mixed Fabrics</option>
                <option value="Blend">Blend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-slate-500">Condition:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="All">All Conditions</option>
                <option value="Recyclable">Recyclable</option>
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Heavily Damaged">Heavily Damaged</option>
                <option value="Unsorted">Unsorted</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Inventory Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">Loading textile inventory records...</p>
            </div>
          ) : inventories.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                No inventory batches yet
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                Your textile waste inventory is currently empty. Click "+ Register Waste Batch" above to log your first batch.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Batch ID</th>
                    <th className="py-3.5 px-6">Fabric Type</th>
                    <th className="py-3.5 px-6">Source</th>
                    <th className="py-3.5 px-6">Quantity</th>
                    <th className="py-3.5 px-6">Color</th>
                    <th className="py-3.5 px-6">Condition</th>
                    <th className="py-3.5 px-6">Collection Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-sm">
                  {inventories.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-blue-600 group-hover:text-blue-700">
                        {item.wasteBatchId}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {item.fabricType}
                      </td>
                      <td className="py-4 px-6 text-slate-600">{item.source}</td>
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {item.quantity} kg
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="inline-flex items-center space-x-1.5">
                          <span>{item.color}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.condition === "Recyclable"
                              ? "bg-green-100 text-green-700"
                              : item.condition === "Good"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {item.collectionDate
                          ? new Date(item.collectionDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInventory(item._id, item.wasteBatchId);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Right-Side Batch Details Drawer */}
      {isDrawerOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-left">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Batch Details</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    {selectedBatch.wasteBatchId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Comprehensive textile inventory manifest</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                aria-label="Close details drawer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Highlight KPI Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 tracking-wider">Weight</span>
                  <p className="text-lg font-black text-slate-900 tabular-nums">{selectedBatch.quantity} <span className="text-xs font-normal text-slate-500">kg</span></p>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Condition</span>
                  <p className="text-xs font-extrabold text-emerald-800 truncate">{selectedBatch.condition || "N/A"}</p>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-3 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-700 tracking-wider">Readiness</span>
                  <p className="text-xs font-extrabold text-indigo-800 truncate">
                    {selectedBatch.condition === "Recyclable" ? "100% High" : selectedBatch.condition === "Good" ? "85% Moderate" : selectedBatch.condition === "Damaged" ? "40% Repair" : "20% Downcycle"}
                  </p>
                </div>
              </div>

              {/* Batch Specifications Grid */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Batch Specifications</h3>
                <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 divide-y divide-slate-100 text-xs">
                  <div className="flex items-center justify-between p-3">
                    <span className="font-semibold text-slate-500">Batch ID</span>
                    <span className="font-mono font-bold text-slate-900">{selectedBatch.wasteBatchId}</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="font-semibold text-slate-500">Fabric Type</span>
                    <span className="font-bold text-slate-900">{selectedBatch.fabricType}</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="font-semibold text-slate-500">Source / Origin</span>
                    <span className="font-medium text-slate-800">{selectedBatch.source}</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="font-semibold text-slate-500">Color</span>
                    <span className="font-medium text-slate-800 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-300" style={{ backgroundColor: selectedBatch.color?.toLowerCase() || '#ccc' }}></span>
                      <span>{selectedBatch.color}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="font-semibold text-slate-500">Collection Date</span>
                    <span className="font-medium text-slate-800 tabular-nums">
                      {selectedBatch.collectionDate ? new Date(selectedBatch.collectionDate).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="font-semibold text-slate-500">System Log Date</span>
                    <span className="font-medium text-slate-800 tabular-nums">
                      {selectedBatch.createdAt ? new Date(selectedBatch.createdAt).toLocaleString() : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Circular Directive Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Circular Directive</h3>
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs space-y-1.5">
                  <span className="font-bold text-blue-900">Recommended Processing Pathway</span>
                  <p className="text-blue-800 leading-relaxed">
                    {selectedBatch.condition === "Recyclable"
                      ? "Direct mechanical shredding & fiber respinning into high-tenacity yarn."
                      : selectedBatch.condition === "Good"
                      ? "Secondary sorting and sanitization for garment resale or upcycling."
                      : selectedBatch.condition === "Damaged"
                      ? "Chemical depolymerization & fiber recovery for recycled polyester/nylon blends."
                      : "Industrial shoddy fiber processing for thermal insulation and acoustic padding."}
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-4 border-t border-slate-200/80 bg-slate-50/90 flex items-center gap-3">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setEditingItem(selectedBatch);
                  setIsModalOpen(true);
                }}
                className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs border border-slate-200/80 shadow-2xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Batch</span>
              </button>

              <button
                onClick={() => generateBatchPdfReport(selectedBatch)}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefillMaterial(null);
        }}
        onSave={handleSaveInventory}
        editingItem={editingItem}
        prefillMaterial={prefillMaterial}
      />

      <Footer />
    </div>
  );
};

export default InventoryDashboard;

