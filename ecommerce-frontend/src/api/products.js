import api from "./apiConfig";

export const getProducts = () => {
  return api.get("/api/products");
};

export const createProduct = (payload) => {
  return api.post("/api/products", payload);
};
