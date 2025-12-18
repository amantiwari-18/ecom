import React from 'react';
import './DeleteConfirmation.css';

const DeleteConfirmation = ({ item, onConfirm, onCancel }) => {
  return (
    <div className="confirmation-overlay" onClick={onCancel}>
      <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-icon">⚠️</div>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        <div className="confirmation-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
