import apiClient from "./apiClient";

export const getProducts = () => apiClient.get("/products");

export const createProductWithImage = (formData) =>
  apiClient.post("/products/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updatePlatforms = (id, platforms) =>
  apiClient.put(`/products/${id}/platforms`, platforms);

export const updateImages = (id, images) => {
  const fd = new FormData();
  images.forEach((img) => fd.append("images", img));
  return apiClient.put(`/products/${id}/images`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
