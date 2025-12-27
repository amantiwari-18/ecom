import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import ProductDetail from "./components/ProductDetail";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, requireCustomer = false }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (requireCustomer && user.role !== "customer") {
      return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/dashboard" /> : 
              <Register />
            } 
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <div className="app-header">
                    <div className="header-left">
                      <h2>Welcome, {user.email || "User"}</h2>
                      {user.role && <span className="role-badge">{user.role}</span>}
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route 
                      path="/" 
                      element={
                        user.role === "customer" ? 
                        <CustomerDashboard /> : 
                        <Navigate to="/dashboard" />
                      } 
                    />
                    <Route 
                      path="/product/:id" 
                      element={
                        user.role === "customer" ? 
                        <ProductDetail /> : 
                        <Navigate to="/dashboard" />
                      } 
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;