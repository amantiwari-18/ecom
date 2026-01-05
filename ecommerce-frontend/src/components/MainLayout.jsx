import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const isCustomerPage = location.pathname === '/' || location.pathname.startsWith('/product');

  return (
    <div className="app-container">
    
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
};

export default MainLayout;