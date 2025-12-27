import React, { useEffect, useState } from "react";
import { getProducts, createProductWithImage } from "../../api/products";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  /* ===================== FORM STATE ===================== */

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    availablePlatforms: [],
    imageFiles: [],
  });

  const [platformInput, setPlatformInput] = useState("");

  const [externalLinks, setExternalLinks] = useState([]);
  const [linkInput, setLinkInput] = useState({
    platform: "",
    url: "",
  });

  /* ===================== LOAD PRODUCTS ===================== */

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

  /* ===================== PLATFORM HANDLERS ===================== */

  const addPlatform = () => {
    if (!platformInput.trim()) return;

    setFormData((prev) => ({
      ...prev,
      availablePlatforms: [...prev.availablePlatforms, platformInput.trim()],
    }));
    setPlatformInput("");
  };

  const removePlatform = (index) => {
    setFormData((prev) => ({
      ...prev,
      availablePlatforms: prev.availablePlatforms.filter((_, i) => i !== index),
    }));
  };

  /* ===================== EXTERNAL LINKS ===================== */

  const addExternalLink = () => {
    if (!linkInput.platform.trim() || !linkInput.url.trim()) return;

    setExternalLinks((prev) => [...prev, linkInput]);
    setLinkInput({ platform: "", url: "" });
  };

  const removeExternalLink = (index) => {
    setExternalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===================== IMAGES ===================== */

  const handleImagesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      imageFiles: Array.from(e.target.files),
    }));
  };

  /* ===================== CREATE PRODUCT ===================== */

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const fd = new FormData();

      fd.append("name", formData.name);
      fd.append("description", formData.description || "");
      fd.append("price", formData.price);
      fd.append("categoryId", formData.categoryId || "");

      formData.availablePlatforms.forEach((p) =>
        fd.append("availablePlatforms", p)
      );

      externalLinks.forEach((link, index) => {
        fd.append(`externalLinks[${index}].platform`, link.platform);
        fd.append(`externalLinks[${index}].url`, link.url);
      });

      formData.imageFiles.forEach((file) =>
        fd.append("images", file)
      );

      await createProductWithImage(fd);
      await loadProducts();

      /* Reset form */
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        availablePlatforms: [],
        imageFiles: [],
      });
      setExternalLinks([]);
    } catch (err) {
      console.error(err);
      setError("Failed to create product.");
    } finally {
      setCreating(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6 p-6 text-white">
      <h1 className="text-2xl font-semibold">Manage Products</h1>

      {error && (
        <div className="rounded border border-red-500 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* ===================== PRODUCT LIST ===================== */}
        <div className="rounded-lg bg-slate-900 p-5 shadow-lg">
          <h2 className="mb-4 font-semibold text-lg">Products</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-700">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr className="text-left text-slate-300">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Platforms</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">${parseFloat(p.price).toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.availablePlatforms?.map((platform, idx) => (
                            <span key={idx} className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs">
                              {platform}
                            </span>
                          )) || "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500">
                        <div className="flex flex-col items-center">
                          <svg className="mb-2 h-12 w-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          No products found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===================== CREATE PRODUCT ===================== */}
        <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl">
          <h2 className="mb-4 font-semibold text-lg">Create Product</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="mb-1 block text-sm text-slate-300">Product Name</label>
              <input
                placeholder="e.g., Gaming Laptop"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm text-slate-300">Description</label>
              <textarea
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-1 block text-sm text-slate-300">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-3 pl-8 pr-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="mb-1 block text-sm text-slate-300">Available Platforms</label>
              <div className="flex gap-2">
                <input
                  placeholder="Add a platform"
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlatform())}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 p-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addPlatform}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 font-medium hover:from-indigo-700 hover:to-indigo-600"
                >
                  Add
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {formData.availablePlatforms.map((p, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 px-3 py-1.5 text-sm"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removePlatform(i)}
                      className="ml-1 rounded-full bg-slate-700/50 p-0.5 text-xs hover:bg-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* External Links */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm text-slate-300">External Links</label>
                <button
                  type="button"
                  onClick={addExternalLink}
                  disabled={!linkInput.platform.trim() || !linkInput.url.trim()}
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1.5 text-sm font-medium disabled:opacity-50 hover:from-emerald-700 hover:to-emerald-600 disabled:hover:from-emerald-600 disabled:hover:to-emerald-500"
                >
                  Add Link
                </button>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <input
                  placeholder="Platform"
                  value={linkInput.platform}
                  onChange={(e) =>
                    setLinkInput({ ...linkInput, platform: e.target.value })
                  }
                  className="rounded-lg border border-slate-700 bg-slate-800/50 p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  placeholder="Product URL"
                  value={linkInput.url}
                  onChange={(e) =>
                    setLinkInput({ ...linkInput, url: e.target.value })
                  }
                  className="rounded-lg border border-slate-700 bg-slate-800/50 p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                {externalLinks.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-slate-700/50 px-2 py-1 text-xs font-medium">
                        {l.platform}
                      </div>
                      <div className="truncate text-sm text-slate-300">{l.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExternalLink(i)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="mb-1 block text-sm text-slate-300">Product Images</label>
              <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/30 p-4 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="mb-2 h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-400">
                      {formData.imageFiles.length > 0
                        ? `${formData.imageFiles.length} file(s) selected`
                        : "Click to upload images"}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={creating}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {creating ? (
                <span className="flex items-center justify-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Product...
                </span>
              ) : (
                "Create Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;