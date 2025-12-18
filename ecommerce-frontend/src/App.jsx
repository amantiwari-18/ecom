import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

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

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="App">
      {!user ? (
        showRegister ? (
          <Register
            onRegister={handleRegisterSuccess}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )
      ) : (
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
          <Dashboard />
        </>
      )}
    </div>
  );
}

export default App;
