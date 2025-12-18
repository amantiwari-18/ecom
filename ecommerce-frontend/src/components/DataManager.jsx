import React, { useState, useEffect, useRef } from 'react';
import * as apiService from '../services/api.service';
import FormModal from './FormModal';
import DeleteConfirmation from './DeleteConfirmation';
import './DataManager.css';

const DataManager = ({ section }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Reset initialization when section changes
    hasInitialized.current = false;
  }, [section]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchItems();
    }
  }, [section]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let response;
      if (section === 'products') {
        response = await apiService.getProducts();
      } else if (section === 'categories') {
        response = await apiService.getCategories();
      } else if (section === 'inventory') {
        response = await apiService.getInventory();
      }
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (section === 'products') {
        await apiService.deleteProduct(selectedItem.id);
      } else if (section === 'categories') {
        await apiService.deleteCategory(selectedItem.id);
      }
      setShowDeleteConfirm(false);
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSave = async (data) => {
    await fetchItems();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="data-manager">
      <div className="header">
        <h2>{section.charAt(0).toUpperCase() + section.slice(1)}</h2>
        {section !== 'inventory' && (
          <button className="create-btn" onClick={handleCreate}>
            + Add New
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="no-items">No {section} found.</p>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {section === 'products' && (
                  <>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </>
                )}
                {section === 'categories' && (
                  <>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </>
                )}
                {section === 'inventory' && (
                  <>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id || item.productId}>
                  {section === 'products' && (
                    <>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>₹{item.price}</td>
                      <td>{item.categoryId}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                  {section === 'categories' && (
                    <>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                  {section === 'inventory' && (
                    <>
                      <td>{item.productId}</td>
                      <td>{item.quantity}</td>
                      <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <FormModal
          section={section}
          item={isEditing ? selectedItem : null}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          item={selectedItem}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default DataManager;
