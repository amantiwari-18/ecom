import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, getMe, register as registerApi } from "../api/auth";
import { getToken, setToken, clearToken, getUser, setUser, clearUser } from "../utils/storage";
import { ROLES } from "../utils/roles";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getUser());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const syncAuth = (newToken, newUser) => {
    setTokenState(newToken);
    setUserState(newUser);
    if (newToken) {
      setToken(newToken);
    } else {
      clearToken();
    }
    if (newUser) {
      setUser(newUser);
    } else {
      clearUser();
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const existingToken = getToken();
      const existingUser = getUser();

      if (!existingToken) {
        syncAuth(null, null);
        setInitializing(false);
        return;
      }

      try {
        if (!existingUser) {
          const { data } = await getMe();
          syncAuth(existingToken, data);
        } else {
          syncAuth(existingToken, existingUser);
        }
      } catch (error) {
        console.error("Failed to bootstrap auth:", error);
        syncAuth(null, null);
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      const data = response?.data ?? response ?? {};

      // Normalize token from various backends
      const token =
        data?.token ?? data?.accessToken ?? data?.authToken ?? null;

      // Normalize user: prefer data.user, otherwise construct from top-level fields
      const user =
        data?.user ??
        (data?.userId || data?.role || data?.email || data?.name
          ? {
              id: data?.userId ?? data?.id,
              role: data?.role ?? undefined,
              name: data?.name ?? undefined,
              email: data?.email ?? undefined,
            }
          : null);

      syncAuth(token, user);
      return data;
    } catch (error) {
      syncAuth(null, null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // New: register method (normalize response similar to login)
  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await registerApi(payload);
      const data = response?.data ?? response ?? {};

      const token =
        data?.token ?? data?.accessToken ?? data?.authToken ?? null;

      const user =
        data?.user ??
        (data?.userId || data?.role || data?.email || data?.name
          ? {
              id: data?.userId ?? data?.id,
              role: data?.role ?? undefined,
              name: data?.name ?? undefined,
              email: data?.email ?? undefined,
            }
          : null);

      // If backend returns token/user, sign in immediately
      syncAuth(token, user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    syncAuth(null, null);
  };

  const hasRole = (role) => {
    if (!user?.role) return false;
    return user.role === role;
  };

  const isAdmin = () => hasRole(ROLES.ADMIN);

  const value = {
    token,
    user,
    loading,
    initializing,
    login,
    register, // ...existing code may already expose register
    logout,
    hasRole,
    isAdmin,
    // consider authenticated if we have a token OR user (cookie-based backends may not return token)
    isAuthenticated: !!token || !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
