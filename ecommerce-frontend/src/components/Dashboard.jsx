import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="loading">No user data found</div>;
  }

  // Check role and render appropriate dashboard
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (user.role === 'CUSTOMER') {
    return <CustomerDashboard />;
  } else {
    return <div className="loading">Unknown user role</div>;
  }
};

export default Dashboard;
