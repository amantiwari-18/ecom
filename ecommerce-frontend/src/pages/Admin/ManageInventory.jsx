import React, { useEffect, useState } from "react";
import { getInventory, updateInventory } from "../../api/inventory";

const ManageInventory = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingQty, setEditingQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getInventory();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingQty(item.quantity ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingQty("");
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      await updateInventory(id, { quantity: Number(editingQty) });
      setEditingId(null);
      setEditingQty("");
      await loadInventory();
    } catch (err) {
      console.error(err);
      setError("Failed to update inventory.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manage Inventory</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track and update stock levels.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Inventory Items
          </h2>
          {loading && (
            <span className="text-xs text-slate-500">
              Loading inventory...
            </span>
          )}
        </div>
        {error && (
          <div className="mb-3 rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase text-slate-400">
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-slate-100">
                    {item.name || item.id}
                  </td>
                  <td className="px-3 py-2 text-slate-200">
                    {item.productName || "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-200">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editingQty}
                        onChange={(e) => setEditingQty(e.target.value)}
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editingId === item.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={saving}
                          className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-slate-500"
                    colSpan={4}
                  >
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
