# generate-frontend.ps1
# Run from your project root (where package.json is).
# This script creates the src/ structure and populates all files with working code.

# 1. Create directory structure
$directories = @(
  "src",
  "src/api",
  "src/components",
  "src/context",
  "src/layouts",
  "src/pages",
  "src/pages/Login",
  "src/pages/Dashboard",
  "src/pages/Admin",
  "src/pages/User",
  "src/router",
  "src/utils"
)

foreach ($dir in $directories) {
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
}

# 2. Create apiConfig.js
$apiConfig = @'
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "https://your-backend-domain.com";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
'@
Set-Content -Path "src/api/apiConfig.js" -Value $apiConfig -Encoding UTF8

# 3. Create auth.js
$authApi = @'
import api from "./apiConfig";

export const login = (credentials) => {
  return api.post("/api/auth/login", credentials);
};

export const getMe = () => {
  return api.get("/api/user/me");
};
'@
Set-Content -Path "src/api/auth.js" -Value $authApi -Encoding UTF8

# 4. Create users.js
$usersApi = @'
import api from "./apiConfig";

export const getAllUsers = () => {
  return api.get("/api/admin/users");
};

export const createUser = (payload) => {
  return api.post("/api/admin/users", payload);
};

export const deleteUser = (id) => {
  return api.delete(`/api/admin/users/${id}`);
};
'@
Set-Content -Path "src/api/users.js" -Value $usersApi -Encoding UTF8

# 5. Create products.js
$productsApi = @'
import api from "./apiConfig";

export const getProducts = () => {
  return api.get("/api/products");
};

export const createProduct = (payload) => {
  return api.post("/api/admin/products", payload);
};
'@
Set-Content -Path "src/api/products.js" -Value $productsApi -Encoding UTF8

# 6. Create inventory.js
$inventoryApi = @'
import api from "./apiConfig";

export const getInventory = () => {
  return api.get("/api/inventory");
};

export const updateInventory = (id, payload) => {
  return api.put(`/api/admin/inventory/${id}`, payload);
};
'@
Set-Content -Path "src/api/inventory.js" -Value $inventoryApi -Encoding UTF8

# 7. Create roles.js
$rolesUtil = @'
export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};
'@
Set-Content -Path "src/utils/roles.js" -Value $rolesUtil -Encoding UTF8

# 8. Create storage.js
$storageUtil = @'
const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || null;
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};
'@
Set-Content -Path "src/utils/storage.js" -Value $storageUtil -Encoding UTF8

# 9. Create AuthContext.jsx
$authContext = @'
import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, getMe } from "../api/auth";
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
      const { data } = await loginApi({ email, password });
      // Expecting { token, user }
      syncAuth(data.token, data.user);
      return data;
    } catch (error) {
      syncAuth(null, null);
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
    logout,
    hasRole,
    isAdmin,
    isAuthenticated: !!token,
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
'@
Set-Content -Path "src/context/AuthContext.jsx" -Value $authContext -Encoding UTF8

# 10. Create ProtectedRoute.jsx
$protectedRoute = @'
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && user?.role !== ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
'@
Set-Content -Path "src/components/ProtectedRoute.jsx" -Value $protectedRoute -Encoding UTF8

# 11. Create Navbar.jsx
$navbar = @'
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-tight">
          MyERP
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-200">
              {user.name || user.email}{" "}
              <span className="rounded bg-slate-700 px-2 py-0.5 text-xs uppercase">
                {user.role === ROLES.ADMIN ? "Admin" : "User"}
              </span>
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-md border border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
'@
Set-Content -Path "src/components/Navbar.jsx" -Value $navbar -Encoding UTF8

# 12. Create Sidebar.jsx
$sidebar = @'
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const linkClass =
  "block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-800 hover:text-white";
const activeClass = "bg-slate-800 text-white";

const Sidebar = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <aside className="h-full w-60 border-r border-slate-800 bg-slate-900 text-slate-200">
      <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Navigation
      </div>
      <nav className="space-y-1 px-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Profile
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          Orders
        </NavLink>

        {isAdmin && (
          <>
            <div className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin
            </div>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              Manage Users
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              Manage Products
            </NavLink>
            <NavLink
              to="/admin/inventory"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              Manage Inventory
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
'@
Set-Content -Path "src/components/Sidebar.jsx" -Value $sidebar -Encoding UTF8

# 13. Create AdminLayout.jsx
$adminLayout = @'
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
'@
Set-Content -Path "src/layouts/AdminLayout.jsx" -Value $adminLayout -Encoding UTF8

# 14. Create UserLayout.jsx
$userLayout = @'
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const UserLayout = () => {
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
'@
Set-Content -Path "src/layouts/UserLayout.jsx" -Value $userLayout -Encoding UTF8

# 15. Create Login.jsx
$loginPage = @'
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/roles";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);
      const role = data?.user?.role;

      if (role === ROLES.ADMIN) {
        navigate("/admin/users", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          Sign in to <span className="text-indigo-400">MyERP</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
'@
Set-Content -Path "src/pages/Login/Login.jsx" -Value $loginPage -Encoding UTF8

# 16. Create Dashboard.jsx
$dashboardPage = @'
import React from "react";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-slate-200">
          Welcome back,{" "}
          <span className="font-semibold">
            {user?.name || user?.email || "User"}
          </span>
          .
        </p>
        <p className="mt-2 text-sm text-slate-400">
          This is your central overview. From here you can access your profile,
          orders, and (if you are an admin) the management sections.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
'@
Set-Content -Path "src/pages/Dashboard/Dashboard.jsx" -Value $dashboardPage -Encoding UTF8

# 17. Create Admin ManageUsers.jsx
$manageUsersPage = @'
import React, { useEffect, useState } from "react";
import { getAllUsers, createUser, deleteUser } from "../../api/users";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      await createUser({ email, role });
      setEmail("");
      setRole("USER");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manage Users</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create, view, and remove application users.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Existing Users
            </h2>
            {loading && (
              <span className="text-xs text-slate-500">Loading users...</span>
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
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2 text-slate-100">
                      {u.email || u.name}
                    </td>
                    <td className="px-3 py-2 text-slate-200">{u.role}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="rounded-md border border-red-500/60 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-slate-500"
                      colSpan={3}
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Create User
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="newuser@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Role
              </label>
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-1 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
'@
Set-Content -Path "src/pages/Admin/ManageUsers.jsx" -Value $manageUsersPage -Encoding UTF8

# 18. Create Admin ManageProducts.jsx
$manageProductsPage = @'
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
'@
Set-Content -Path "src/pages/Admin/ManageProducts.jsx" -Value $manageProductsPage -Encoding UTF8

# 19. Create Admin ManageInventory.jsx
$manageInventoryPage = @'
import React, { useEffect, useState } from "react";
import { getInventory, updateInventory } from "../../api/inventory";

const ManageInventory = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingQty, setEditingQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getInventory();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingQty(item.quantity ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingQty("");
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      await updateInventory(id, { quantity: Number(editingQty) });
      setEditingId(null);
      setEditingQty("");
      await loadInventory();
    } catch (err) {
      console.error(err);
      setError("Failed to update inventory.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Manage Inventory</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track and update stock levels.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Inventory Items
          </h2>
          {loading && (
            <span className="text-xs text-slate-500">
              Loading inventory...
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
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-slate-100">
                    {item.name || item.id}
                  </td>
                  <td className="px-3 py-2 text-slate-200">
                    {item.productName || "-"}
                  </td>
                  <td className="px-3 py-2 text-slate-200">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={editingQty}
                        onChange={(e) => setEditingQty(e.target.value)}
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {editingId === item.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={saving}
                          className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-slate-500"
                    colSpan={4}
                  >
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
'@
Set-Content -Path "src/pages/Admin/ManageInventory.jsx" -Value $manageInventoryPage -Encoding UTF8

# 20. Create User Profile.jsx
$userProfilePage = @'
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMe } from "../../api/auth";

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await getMe();
        setUser(data);
      } catch (err) {
        console.error("Failed to refresh profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Profile</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        {loading && (
          <p className="mb-2 text-sm text-slate-400">Refreshing profile...</p>
        )}
        <div className="space-y-2 text-sm text-slate-200">
          <div>
            <span className="text-slate-400">Name: </span>
            <span>{user?.name || "-"}</span>
          </div>
          <div>
            <span className="text-slate-400">Email: </span>
            <span>{user?.email || "-"}</span>
          </div>
          <div>
            <span className="text-slate-400">Role: </span>
            <span>{user?.role || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
'@
Set-Content -Path "src/pages/User/Profile.jsx" -Value $userProfilePage -Encoding UTF8

# 21. Create User Orders.jsx
$userOrdersPage = @'
import React from "react";

const Orders = () => {
  // You can wire this up to a real endpoint when available.
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Orders</h1>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm text-slate-300">
          This is a placeholder orders page. Integrate with your backend order
          endpoints when they are ready.
        </p>
      </div>
    </div>
  );
};

export default Orders;
'@
Set-Content -Path "src/pages/User/Orders.jsx" -Value $userOrdersPage -Encoding UTF8

# 22. Create AppRouter.jsx
$appRouter = @'
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import ManageUsers from "../pages/Admin/ManageUsers";
import ManageProducts from "../pages/Admin/ManageProducts";
import ManageInventory from "../pages/Admin/ManageInventory";
import Profile from "../pages/User/Profile";
import Orders from "../pages/User/Orders";

import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* User routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/products" element={<ManageProducts />} />
            <Route path="/admin/inventory" element={<ManageInventory />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
'@
Set-Content -Path "src/router/AppRouter.jsx" -Value $appRouter -Encoding UTF8

# 23. Create App.jsx
$app = @'
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
'@
Set-Content -Path "src/App.jsx" -Value $app -Encoding UTF8

# 24. Create main.jsx
$main = @'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@
Set-Content -Path "src/main.jsx" -Value $main -Encoding UTF8

# 25. Create index.css with Tailwind setup
$indexCss = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-slate-950 text-slate-100;
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

#root {
  min-height: 100vh;
}
'@
Set-Content -Path "src/index.css" -Value $indexCss -Encoding UTF8

Write-Host "React frontend structure and files have been generated under src/."
Write-Host "Make sure TailwindCSS and React Router v6 are installed and configured in your project."
