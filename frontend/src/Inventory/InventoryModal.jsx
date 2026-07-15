import React, { useState, useEffect } from "react";

const FABRIC_TYPES = [
  "Cotton",
  "Polyester",
  "Wool",
  "Silk",
  "Linen",
  "Denim",
  "Nylon",
  "Rayon",
  "Acrylic",
  "Mixed Fabrics",
  "Blend",
  "Other",
];

const SOURCES = [
  "Garment Factory",
  "Post-Consumer",
  "Mill Waste",
  "Boutique",
  "Retail Return",
  "Other",
];

const CONDITIONS = [
  "Recyclable",
  "Good",
  "Damaged",
  "Heavily Damaged",
  "Unsorted",
];

const InventoryModal = ({ isOpen, onClose, onSave, editingItem, prefillMaterial }) => {
  const [formData, setFormData] = useState({
    wasteBatchId: "",
    fabricType: "Cotton",
    source: "Garment Factory",
    quantity: "",
    color: "",
    condition: "Recyclable",
    collectionDate: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        wasteBatchId: editingItem.wasteBatchId || "",
        fabricType: editingItem.fabricType || "Cotton",
        source: editingItem.source || "Garment Factory",
        quantity: editingItem.quantity || "",
        color: editingItem.color || "",
        condition: editingItem.condition || "Recyclable",
        collectionDate: editingItem.collectionDate
          ? new Date(editingItem.collectionDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        wasteBatchId: `BATCH-${Date.now().toString().slice(-6)}`,
        fabricType: prefillMaterial || "Cotton",
        source: "Garment Factory",
        quantity: "",
        color: "",
        condition: "Recyclable",
        collectionDate: new Date().toISOString().split("T")[0],
      });
    }
    setError("");
  }, [editingItem, isOpen, prefillMaterial]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.wasteBatchId ||
      !formData.fabricType ||
      !formData.source ||
      formData.quantity === "" ||
      !formData.color ||
      !formData.condition
    ) {
      setError("Please fill out all required inventory fields.");
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        quantity: Number(formData.quantity),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save inventory item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {editingItem ? "Update Inventory Batch" : "Register New Textile Batch"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg px-2"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waste Batch ID
              </label>
              <input
                type="text"
                name="wasteBatchId"
                value={formData.wasteBatchId}
                onChange={handleChange}
                required
                placeholder="BATCH-10024"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Collection Date
              </label>
              <input
                type="date"
                name="collectionDate"
                value={formData.collectionDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fabric Type
              </label>
              <select
                name="fabricType"
                value={formData.fabricType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 text-sm bg-white"
              >
                {FABRIC_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waste Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 text-sm bg-white"
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity (kg)
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                placeholder="e.g. 150"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                required
                placeholder="Navy Blue"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Condition & Recycling Status
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-900 text-sm bg-white"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingItem
                ? "Update Batch"
                : "Register Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
