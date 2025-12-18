import React, { useState } from 'react';
import DataManager from './DataManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'inventory', label: 'Inventory', icon: '📊' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        
        {!activeSection ? (
          <div className="icons-grid">
            {sections.map((section) => (
              <div
                key={section.id}
                className="icon-card"
                onClick={() => setActiveSection(section.id)}
              >
                <span className="icon">{section.icon}</span>
                <p>{section.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="data-manager-container">
            <button
              className="back-btn"
              onClick={() => setActiveSection(null)}
            >
              ← Back
            </button>
            <DataManager section={activeSection} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
