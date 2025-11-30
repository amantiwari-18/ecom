import api from "./apiConfig";

export const login = (credentials) => {
  return api.post("/api/auth/login", credentials);
};

export const getMe = () => {
  return api.get("/api/user/me");
};

// Add register API (POST /api/users)
export const register = (payload) => {
  return api.post("/api/users", payload);
};
