import React, { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (c) => {
    setEditingId(c.id);
    setName(c.name || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateCategory(editingId, { name });
      } else {
        await createCategory({ name });
      }
      setName("");
      setEditingId(null);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this category? This cannot be undone.");
    if (!ok) return;
    setError("");
    try {
      await deleteCategory(id);
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manage Categories</h1>
        <p className="mt-1 text-sm text-slate-400">Create, edit, and delete categories.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Categories</h2>
            {loading && <span className="text-xs text-slate-500">Loading...</span>}
          </div>
          {error && (
            <div className="mb-3 rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase text-slate-400">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 text-slate-100">{c.name}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(c)} className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="rounded-md border border-red-600 px-2 py-1 text-xs text-red-300 hover:bg-red-800/10">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && !loading && (
                  <tr>
                    <td className="px-3 py-4 text-center text-slate-500" colSpan={2}>No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Create / Edit</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70">{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
              {editingId && <button type="button" onClick={cancelEdit} className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200">Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
