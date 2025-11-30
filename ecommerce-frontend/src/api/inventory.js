import api from "./apiConfig";

export const getInventory = () => {
  return api.get("/api/inventory");
};

export const updateInventory = (id, payload) => {
  return api.put(`/api/admin/inventory/${id}`, payload);
};
