import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CustomerDashboard from "./components/CustomerDashboard";
import ProductDetail from "./components/ProductDetail";
import MainLayout from "./components/MainLayout";
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

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? <Navigate to="/" /> : 
              <Register />
            } 
          />

          {/* Protected Routes */}
          {user ? (
            <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Customer routes */}
              <Route path="/" element={<CustomerDashboard />} />
              <Route path="/products" element={<CustomerDashboard />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;