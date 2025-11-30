import React, { useEffect, useState } from "react";
import { getProducts, createProduct } from "../../api/products";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      await createProduct({ name, sku });
      setName("");
      setSku("");
      await loadProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to create product.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manage Products</h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure the products available in your ERP.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Products
            </h2>
            {loading && (
              <span className="text-xs text-slate-500">
                Loading products...
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
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">SKU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-slate-100">{p.name}</td>
                    <td className="px-3 py-2 text-slate-200">{p.sku}</td>
                  </tr>
                ))}
                {products.length === 0 && !loading && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-slate-500"
                      colSpan={2}
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Create Product
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Name
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                SKU
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-1 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
