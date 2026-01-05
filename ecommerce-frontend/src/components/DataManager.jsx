import React, { useState, useEffect } from 'react';
import FormModal from './FormModal';
import './DataManager.css';

const DataManager = ({ section }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const API_BASE_URL = 'http://localhost:8080/api';

  // API endpoints based on section
  const getApiEndpoint = () => {
    switch(section) {
      case 'products':
        return `${API_BASE_URL}/products/aman-get-all`;
      case 'categories':
        return `${API_BASE_URL}/categories`;
      case 'inventory':
        return `${API_BASE_URL}/inventory`;
      default:
        return '';
    }
  };

  const getDeleteEndpoint = (id) => {
    switch(section) {
      case 'products':
        return `${API_BASE_URL}/products/aman-delete/${id}`;
      case 'categories':
        return `${API_BASE_URL}/categories/${id}`;
      case 'inventory':
        return `${API_BASE_URL}/inventory/${id}`;
      default:
        return '';
    }
  };

  useEffect(() => {
    fetchData();
  }, [section, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const url = getApiEndpoint();
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle response format for Aman APIs
      if (section === 'products') {
        if (result.success && result.products) {
          setData(result.products);
        } else if (Array.isArray(result)) {
          setData(result);
        } else {
          setData([]);
        }
      } else if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(`Error fetching ${section}:`, err);
      setError(`Failed to load ${section}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    // REMOVED CONFIRMATION DIALOG AS REQUESTED
    try {
      const url = getDeleteEndpoint(id);
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${errorText}`);
      }

      // Refresh data
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error(`Error deleting ${section.slice(0, -1)}:`, err);
      alert(`Delete failed. Please try again.`);
    }
  };

  const handleSaveSuccess = () => {
    setShowModal(false);
    setRefreshKey(prev => prev + 1);
  };

  const getColumns = () => {
    switch (section) {
      case 'products':
        return [
          { key: 'name', label: 'Name' },
          { key: 'price', label: 'Price', format: (value) => `$${parseFloat(value || 0).toFixed(2)}` },
          { key: 'categoryId', label: 'Category ID' },
          { 
            key: 'images', 
            label: 'Image', 
            format: (images) => images && images.length > 0 ? (
              <img 
                src={`http://localhost:8080${images[0]}`}
                alt="Product" 
                className="product-thumbnail" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiMyRTJBMzkiLz48cGF0aCBkPSJNMzAgMjAuNUMzMCAyMi43MSAyOC4yMSAyNC41IDI2IDI0LjVDMjMuNzkgMjQuNSAyMiAyMi43MSAyMiAyMC41QzIyIDE4LjI5IDIzLjc5IDE2LjUgMjYgMTYuNUMyOC4yMSAxNi41IDMwIDE4LjI5IDMwIDIwLjVaTTI2IDI4LjVDMjEuMzEgMjguNSAxNy4yNCAzMS4yNiAxNSAzNS41TDM3IDM1LjVDMzQuNzYgMzEuMjYgMzAuNjkgMjguNSAyNiAyOC41Wk0xMCAxNUMxMCAxMy44OTUgMTAuODk1IDEzIDEyIDEzSDQwQzQxLjEwNSAxMyA0MiAxMy44OTUgNDIgMTVWMzVDNDIgMzYuMTA1IDQxLjEwNSAzNyA0MCAzN0gxMkMxMC44OTUgMzcgMTAgMzYuMTA1IDEwIDM1VjE1WiIgZmlsbD0iIzQ3NTU2OSIvPjwvc3ZnPg==';
                }}
              />
            ) : 'No Image'
          },
          { 
            key: 'availablePlatforms', 
            label: 'Platforms', 
            format: (platforms) => platforms && platforms.length > 0 ? (
              <div className="platform-tags">
                {platforms.slice(0, 2).map((p, i) => (
                  <span key={i} className="platform-tag">{p}</span>
                ))}
                {platforms.length > 2 && (
                  <span className="platform-tag-more">+{platforms.length - 2}</span>
                )}
              </div>
            ) : 'None'
          },
          { 
            key: 'externalLinks', 
            label: 'Links', 
            format: (links) => links && links.length > 0 ? (
              <div className="links-count">{links.length} links</div>
            ) : 'None'
          },
        ];

      case 'categories':
        return [
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'id', label: 'ID' },
        ];

      case 'inventory':
        return [
          { key: 'productId', label: 'Product ID' },
          { key: 'stock', label: 'Stock', format: (value) => (
            <span className={`stock-badge ${value > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {value}
            </span>
          )},
          { key: 'restockThreshold', label: 'Restock At' },
        ];

      default:
        return [];
    }
  };

  const renderTable = () => {
    const columns = getColumns();

    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading {section}...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchData} className="retry-btn">
            Retry
          </button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p>No {section} found. Create your first one!</p>
          <button onClick={handleCreate} className="create-first-btn">
            Create New
          </button>
        </div>
      );
    }

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || item._id || index}>
                {columns.map((col) => {
                  const value = item[col.key];
                  return (
                    <td key={col.key}>
                      {col.format ? col.format(value) : value || '-'}
                    </td>
                  );
                })}
                <td className="actions-cell">
                  <button
                    onClick={() => handleEdit(item)}
                    className="action-btn edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id || item._id)}
                    className="action-btn delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="data-manager">
      <div className="header-section">
        <div>
          <h2 className="section-title">
            {section.charAt(0).toUpperCase() + section.slice(1)} Management
          </h2>
          <p className="section-description">
            {section === 'products' && 'Manage products, images, and external links'}
            {section === 'categories' && 'Organize products into categories'}
            {section === 'inventory' && 'Track stock levels'}
          </p>
        </div>
        <button onClick={handleCreate} className="create-btn">
          + Create New
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total {section}</h3>
          <p className="stat-number">{data.length}</p>
        </div>
        {section === 'products' && (
          <>
            <div className="stat-card">
              <h3>With Images</h3>
              <p className="stat-number">
                {data.filter(item => item.images && item.images.length > 0).length}
              </p>
            </div>
            <div className="stat-card">
              <h3>With Platforms</h3>
              <p className="stat-number">
                {data.filter(item => item.availablePlatforms && item.availablePlatforms.length > 0).length}
              </p>
            </div>
          </>
        )}
      </div>

      {renderTable()}

      {showModal && (
        <FormModal
          section={section}
          item={selectedItem}
          onSave={handleSaveSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DataManager;