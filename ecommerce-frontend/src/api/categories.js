import api from "./apiConfig";

export const getCategories = () => api.get("/api/categories");

export const getCategory = (id) => api.get(`/api/categories/${id}`);

export const createCategory = (payload) => api.post("/api/categories", payload);

export const updateCategory = (id, payload) => api.put(`/api/categories/${id}`, payload);

export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
