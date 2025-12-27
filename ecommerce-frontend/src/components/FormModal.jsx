import React, { useState, useEffect } from 'react';
import { FiX, FiLink, FiExternalLink, FiPlus, FiUpload } from 'react-icons/fi';
import * as apiService from '../services/api.service';
import './FormModal.css';

const FormModal = ({ section, item, onSave, onClose }) => {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageType, setImageType] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ===== NEW (Platforms) ===== */
  const [platformInput, setPlatformInput] = useState('');
  const [availablePlatforms, setAvailablePlatforms] = useState([]);

  /* ===== NEW (External Links) ===== */
  const [externalLinks, setExternalLinks] = useState([]);
  const [linkInput, setLinkInput] = useState({ platform: '', url: '' });

  /* ================= INIT ================= */

  useEffect(() => {
    if (item) {
      setFormData(item);
      setAvailablePlatforms(item.availablePlatforms || []);
      setExternalLinks(item.externalLinks || []);

      if (item.images && item.images.length > 0) {
        setImagePreview(item.images[0]);
      }
    } else {
      setFormData({});
      setAvailablePlatforms([]);
      setExternalLinks([]);
      setImagePreview(null);
    }
  }, [item]);

  useEffect(() => {
    if (section === 'products') {
      fetchCategories();
    }
  }, [section]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setLoadingCategories(false);
  };

  /* ================= BASIC ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= IMAGE ================= */

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    if (url) setImagePreview(url);
  };

  /* ================= PLATFORMS ================= */

  const addPlatform = () => {
    if (!platformInput.trim()) return;
    setAvailablePlatforms((prev) => [...prev, platformInput.trim()]);
    setPlatformInput('');
  };

  const removePlatform = (index) => {
    setAvailablePlatforms((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= EXTERNAL LINKS ================= */

  const addExternalLink = () => {
    if (!linkInput.platform || !linkInput.url) return;
    setExternalLinks((prev) => [...prev, linkInput]);
    setLinkInput({ platform: '', url: '' });
  };

  const removeExternalLink = (index) => {
    setExternalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (section === 'products') {
        if (item) {
          const fd = new FormData();

          if (formData.name) fd.append('name', formData.name);
          if (formData.description) fd.append('description', formData.description);
          if (formData.price) fd.append('price', formData.price);
          if (formData.categoryId) fd.append('categoryId', formData.categoryId);
          if (formData.imageFile) fd.append('image', formData.imageFile);

          await apiService.updateProduct(item.id, fd);

          if (availablePlatforms.length) {
            await apiService.updatePlatforms(item.id, availablePlatforms);
          }

          if (externalLinks.length) {
            await apiService.updateExternalLinks(item.id, externalLinks);
          }
        } else {
          if (formData.imageFile) {
            const fd = new FormData();

            fd.append('name', formData.name);
            fd.append('description', formData.description || '');
            fd.append('price', formData.price);
            fd.append('categoryId', formData.categoryId);

            availablePlatforms.forEach((p) =>
              fd.append('availablePlatforms', p)
            );

            externalLinks.forEach((l, i) => {
              fd.append(`externalLinks[${i}].platform`, l.platform);
              fd.append(`externalLinks[${i}].url`, l.url);
            });

            fd.append('image', formData.imageFile);

            await apiService.createProductWithImage(fd);
          } else {
            await apiService.createProduct({
              ...formData,
              availablePlatforms,
              externalLinks,
            });
          }
        }
      }

      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= FIELDS ================= */

  const getFields = () => {
    if (section === 'products') {
      return [
        { name: 'name', label: 'Product Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'text' },
        { name: 'price', label: 'Price', type: 'number', required: true },
        { name: 'categoryId', label: 'Category', type: 'select', required: true },
      ];
    }
    return [];
  };

  const fields = getFields();
  const title = item ? `Update ${section}` : `Create New ${section.slice(0, -1)}`;

  /* ================= UI ================= */

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Basic Fields */}
          <div className="form-section">
            <h4>Product Information</h4>
            <div className="form-grid">
              {fields.map((field) => (
                <div key={field.name} className="form-group">
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">
                        {loadingCategories ? 'Loading...' : 'Select a category'}
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      className="form-input"
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image Section */}
          {section === 'products' && (
            <div className="form-section">
              <h4>Product Image</h4>
              <div className="image-type-selector">
                <label className="image-type-option">
                  <input
                    type="radio"
                    name="imageType"
                    value="none"
                    checked={imageType === 'none'}
                    onChange={(e) => setImageType(e.target.value)}
                  />
                  <span>No Image</span>
                </label>
                <label className="image-type-option">
                  <input
                    type="radio"
                    name="imageType"
                    value="upload"
                    checked={imageType === 'upload'}
                    onChange={(e) => setImageType(e.target.value)}
                  />
                  <span>Upload Image</span>
                </label>
                <label className="image-type-option">
                  <input
                    type="radio"
                    name="imageType"
                    value="url"
                    checked={imageType === 'url'}
                    onChange={(e) => setImageType(e.target.value)}
                  />
                  <span>Image URL</span>
                </label>
              </div>

              {imageType === 'upload' && (
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
                    Choose Image
                  </label>
                </div>
              )}

              {imageType === 'url' && (
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={handleImageUrlChange}
                  className="form-input"
                />
              )}

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          )}

          {/* Platforms Section */}
          {section === 'products' && (
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
                >
                  <FiPlus />
                </button>
              </div>

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
            </div>
          )}

          {/* External Links Section - Updated Layout */}
          {section === 'products' && (
            <div className="form-section">
              <div className="section-header">
                <h4>External Links</h4>
                <button
                  type="button"
                  onClick={addExternalLink}
                  disabled={!linkInput.platform.trim() || !linkInput.url.trim()}
                  className="btn-primary"
                >
                  <FiLink className="mr-2" />
                  Add Link
                </button>
              </div>

              <div className="link-input-grid">
                <input
                  type="text"
                  placeholder="Platform"
                  value={linkInput.platform}
                  onChange={(e) =>
                    setLinkInput({ ...linkInput, platform: e.target.value })
                  }
                  className="form-input"
                />
                <input
                  type="url"
                  placeholder="Product URL"
                  value={linkInput.url}
                  onChange={(e) =>
                    setLinkInput({ ...linkInput, url: e.target.value })
                  }
                  className="form-input"
                />
              </div>

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
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-submit">
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {item ? 'Updating...' : 'Creating...'}
                </span>
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