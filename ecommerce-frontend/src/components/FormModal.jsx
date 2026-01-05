import React, { useState, useEffect } from 'react';
import { FiX, FiLink, FiExternalLink, FiPlus, FiUpload } from 'react-icons/fi';
import './FormModal.css';

const FormModal = ({ section, item, onSave, onClose }) => {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageType, setImageType] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // For products
  const [platformInput, setPlatformInput] = useState('');
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  const [linkInput, setLinkInput] = useState({ platform: '', url: '' });

  const API_BASE_URL = 'http://localhost:8080/api';

  // Initialize form
  useEffect(() => {
    if (item) {
      // For products
      if (section === 'products') {
        setFormData({
          name: item.name || '',
          description: item.description || '',
          price: item.price || 0,
          categoryId: item.categoryId || '',
        });
        
        setAvailablePlatforms(item.availablePlatforms || []);
        setExternalLinks(item.externalLinks || []);
        
        // Handle images
        if (item.images && item.images.length > 0) {
          setImagePreview(`http://localhost:8080${item.images[0]}`);
          setImageType('url');
          setFormData(prev => ({ ...prev, imageUrl: item.images[0] }));
        } else {
          setImageType('none');
        }
      } 
      // For categories
      else if (section === 'categories') {
        setFormData({
          name: item.name || '',
          description: item.description || ''
        });
      }
      // For inventory
      else if (section === 'inventory') {
        setFormData({
          productId: item.productId || '',
          stock: item.stock || 0,
          restockThreshold: item.restockThreshold || 10
        });
      }
    } else {
      // Reset to default values for new item
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: '',
        stock: 0,
        restockThreshold: 10
      });
      setAvailablePlatforms([]);
      setExternalLinks([]);
      setImagePreview(null);
      setImageType('none');
      setPlatformInput('');
      setLinkInput({ platform: '', url: '' });
    }
  }, [item, section]);

  // Fetch categories for product form
  useEffect(() => {
    if (section === 'products') {
      fetchCategories();
    }
  }, [section]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
    setLoadingCategories(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, imageUrl: url }));
    if (url) {
      setImagePreview(url);
    }
  };

  // Platform handlers
  const addPlatform = () => {
    if (!platformInput.trim()) return;
    setAvailablePlatforms(prev => [...prev, platformInput.trim()]);
    setPlatformInput('');
  };

  const removePlatform = (index) => {
    setAvailablePlatforms(prev => prev.filter((_, i) => i !== index));
  };

  // External link handlers
  const addExternalLink = () => {
    if (!linkInput.platform.trim() || !linkInput.url.trim()) return;
    setExternalLinks(prev => [...prev, { ...linkInput }]);
    setLinkInput({ platform: '', url: '' });
  };

  const removeExternalLink = (index) => {
    setExternalLinks(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (section === 'products') {
        await handleProductSubmit();
      } else if (section === 'categories') {
        await handleCategorySubmit();
      } else if (section === 'inventory') {
        await handleInventorySubmit();
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product submission
  const handleProductSubmit = async () => {
    // Check required fields
    if (!formData.name || !formData.price || !formData.categoryId) {
      throw new Error('Please fill in all required fields: Name, Price, and Category');
    }

    if (item) {
      // =========== UPDATE EXISTING PRODUCT ===========
      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description || '');
      form.append('price', formData.price.toString());
      form.append('categoryId', formData.categoryId);
      
      // Add image if uploading
      if (imageType === 'upload' && formData.imageFile) {
        form.append('image', formData.imageFile);
      }
      
      // Add arrays as separate parameters
      if (availablePlatforms.length > 0) {
        form.append('platforms', JSON.stringify(availablePlatforms));
      }
      
      if (externalLinks.length > 0) {
        const websiteNames = externalLinks.map(link => link.platform);
        const websiteUrls = externalLinks.map(link => link.url);
        form.append('websiteNames', JSON.stringify(websiteNames));
        form.append('websiteUrls', JSON.stringify(websiteUrls));
      }

      const response = await fetch(`${API_BASE_URL}/products/aman-update/${item.id}`, {
        method: 'PUT',
        body: form
      });

      if (!response.ok) {
        throw new Error(`Failed to update product`);
      }

      const result = await response.json();
      
      if (result.success || result.id) {
        onSave(result.product || result);
      } else {
        throw new Error('Update failed');
      }
      
    } else {
      // =========== CREATE NEW PRODUCT ===========
      // Use query parameters for arrays
      const queryParams = new URLSearchParams();
      queryParams.append('name', formData.name);
      queryParams.append('description', formData.description || '');
      queryParams.append('price', formData.price.toString());
      queryParams.append('categoryId', formData.categoryId);
      
      // Add platforms
      availablePlatforms.forEach(platform => {
        queryParams.append('platforms', platform);
      });
      
      // Add external links
      externalLinks.forEach(link => {
        queryParams.append('websiteNames', link.platform);
        queryParams.append('websiteUrls', link.url);
      });

      // Create FormData for image
      const form = new FormData();
      if (imageType === 'upload' && formData.imageFile) {
        form.append('image', formData.imageFile);
      }

      const url = `${API_BASE_URL}/products/aman-create-product?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        throw new Error(`Failed to create product`);
      }

      const result = await response.json();
      
      if (result.success || result.id) {
        onSave(result.product || result);
      } else {
        throw new Error('Creation failed');
      }
    }
  };

  const handleCategorySubmit = async () => {
    if (!formData.name) {
      throw new Error('Category name is required');
    }

    const url = item ? 
      `${API_BASE_URL}/categories/${item.id}` : 
      `${API_BASE_URL}/categories`;
    
    const method = item ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to ${item ? 'update' : 'create'} category`);
    }

    const result = await response.json();
    onSave(result);
  };

  const handleInventorySubmit = async () => {
    if (!formData.productId) {
      throw new Error('Product ID is required');
    }

    const url = item ? 
      `${API_BASE_URL}/inventory/${item.id}` : 
      `${API_BASE_URL}/inventory`;
    
    const method = item ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: formData.productId,
        stock: formData.stock,
        restockThreshold: formData.restockThreshold
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to ${item ? 'update' : 'create'} inventory`);
    }

    const result = await response.json();
    onSave(result);
  };

  const renderProductForm = () => (
    <>
      {/* Basic Information */}
      <div className="form-section">
        <h4>Product Information</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>
              Product Name *
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter product name"
              />
            </label>
          </div>

          <div className="form-group full-width">
            <label>
              Description
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="form-input"
                rows="3"
                placeholder="Product description"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Price *
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                className="form-input"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Category *
              <select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loadingCategories}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {loadingCategories && <small>Loading categories...</small>}
            </label>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="form-section">
        <h4>Product Image</h4>
        <div className="image-type-selector">
          {['none', 'upload', 'url'].map(type => (
            <label key={type} className="image-type-option">
              <input
                type="radio"
                name="imageType"
                value={type}
                checked={imageType === type}
                onChange={(e) => {
                  setImageType(e.target.value);
                  if (e.target.value === 'none') {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, imageFile: null, imageUrl: null }));
                  }
                }}
              />
              <span>
                {type === 'none' && 'No Image'}
                {type === 'upload' && 'Upload Image'}
                {type === 'url' && 'Image URL'}
              </span>
            </label>
          ))}
        </div>

        {imageType === 'upload' && (
          <div className="form-group">
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-upload-input"
              />
              <label htmlFor="image-upload" className="file-upload-label">
                <FiUpload className="mr-2" />
                {formData.imageFile ? 'Change Image' : 'Choose Image'}
              </label>
            </div>
            {formData.imageFile && (
              <div className="file-info">
                <span className="file-name">{formData.imageFile.name}</span>
                <span className="file-size">
                  ({(formData.imageFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>
        )}

        {imageType === 'url' && (
          <div className="form-group">
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl || ''}
              onChange={handleImageUrlChange}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setFormData(prev => ({ ...prev, imageFile: null, imageUrl: null }));
                setImageType('none');
              }}
              className="remove-image-btn"
            >
              <FiX /> Remove
            </button>
          </div>
        )}
      </div>

      {/* Platforms Section */}
      <div className="form-section">
        <h4>Available Platforms</h4>
        <div className="inline-input-group">
          <input
            type="text"
            placeholder="Add a platform (Amazon, Flipkart...)"
            value={platformInput}
            onChange={(e) => setPlatformInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlatform())}
            className="form-input flex-1"
          />
          <button
            type="button"
            onClick={addPlatform}
            className="btn-secondary"
            disabled={!platformInput.trim()}
          >
            <FiPlus />
          </button>
        </div>

        {availablePlatforms.length > 0 && (
          <div className="platform-chips">
            {availablePlatforms.map((p, i) => (
              <span key={i} className="platform-chip">
                {p}
                <button
                  type="button"
                  onClick={() => removePlatform(i)}
                  className="platform-chip-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* External Links Section */}
      <div className="form-section">
        <h4>External Links</h4>
        <div className="link-input-grid">
          <input
            type="text"
            placeholder="Platform (e.g., Amazon)"
            value={linkInput.platform}
            onChange={(e) => setLinkInput({ ...linkInput, platform: e.target.value })}
            className="form-input"
          />
          <input
            type="url"
            placeholder="https://example.com/product"
            value={linkInput.url}
            onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
            className="form-input"
          />
          <button
            type="button"
            onClick={addExternalLink}
            disabled={!linkInput.platform.trim() || !linkInput.url.trim()}
            className="btn-secondary"
          >
            <FiLink /> Add Link
          </button>
        </div>

        {externalLinks.length > 0 && (
          <div className="external-links-list">
            {externalLinks.map((l, i) => (
              <div key={i} className="external-link-item">
                <div className="link-content">
                  <div className="platform-badge">
                    {l.platform}
                  </div>
                  <div className="link-url">
                    <FiExternalLink className="link-icon" />
                    <span className="truncate">{l.url}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExternalLink(i)}
                  className="remove-link-btn"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderCategoryForm = () => (
    <div className="form-section">
      <h4>Category Information</h4>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>
            Category Name *
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter category name"
            />
          </label>
        </div>

        <div className="form-group full-width">
          <label>
            Description
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Category description"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderInventoryForm = () => (
    <div className="form-section">
      <h4>Inventory Information</h4>
      <div className="form-grid">
        <div className="form-group">
          <label>
            Product ID *
            <input
              type="text"
              name="productId"
              value={formData.productId || ''}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter product ID"
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Stock Quantity *
            <input
              type="number"
              name="stock"
              value={formData.stock || ''}
              onChange={handleChange}
              className="form-input"
              required
              min="0"
              placeholder="0"
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Restock Threshold
            <input
              type="number"
              name="restockThreshold"
              value={formData.restockThreshold || 10}
              onChange={handleChange}
              className="form-input"
              min="0"
              placeholder="10"
            />
            <small className="form-hint">Alert when stock falls below this number</small>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {item ? 'Edit' : 'Create'} 
            {section === 'products' && ' Product'}
            {section === 'categories' && ' Category'}
            {section === 'inventory' && ' Inventory Item'}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {section === 'products' && renderProductForm()}
          {section === 'categories' && renderCategoryForm()}
          {section === 'inventory' && renderInventoryForm()}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  {item ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                item ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;