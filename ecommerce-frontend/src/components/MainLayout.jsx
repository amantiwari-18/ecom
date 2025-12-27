import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const isCustomerPage = location.pathname === '/' || location.pathname.startsWith('/product');

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo">
              🛒 E-Shop
            </Link>
            <nav className="main-nav">
              <Link to="/" className={`nav-link ${isCustomerPage ? 'active' : ''}`}>
                Home
              </Link>
              <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
                Products
              </Link>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                Dashboard
              </Link>
            </nav>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user.name || user.email}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <p>© 2024 E-Shop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;