import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Home from "../pages/Home/Home";
import ManageUsers from "../pages/Admin/ManageUsers";
import ManageProducts from "../pages/Admin/ManageProducts";
import ManageInventory from "../pages/Admin/ManageInventory";
import ManageCategories from "../pages/Admin/ManageCategories";
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
        <Route path="/register" element={<Register />} />

        {/* User routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
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
            <Route path="/admin/categories" element={<ManageCategories />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
