import api from "./apiConfig";

export const getAllUsers = () => {
  return api.get("/api/users");
};

export const createUser = (payload) => {
  return api.post("/api/users", payload);
};

export const deleteUser = (id) => {
  return api.delete(`/api/users/${id}`);
};
