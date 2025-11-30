import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  // While auth is bootstrapping, don't redirect or render anything
  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && user?.role !== ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
