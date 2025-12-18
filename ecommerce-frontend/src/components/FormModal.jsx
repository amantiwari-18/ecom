import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import * as apiService from '../services/api.service';
import './FormModal.css';

const FormModal = ({ section, item, onSave, onClose }) => {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageType, setImageType] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
      if (item.images && item.images.length > 0) {
        setImagePreview(item.images[0]);
      }
    } else {
      setFormData({});
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
    if (url) {
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (section === 'products') {
        if (item) {
          const formDataToSend = new FormData();
          if (formData.name) formDataToSend.append('name', formData.name);
          if (formData.description) formDataToSend.append('description', formData.description);
          if (formData.price) formDataToSend.append('price', formData.price);
          if (formData.categoryId) formDataToSend.append('categoryId', formData.categoryId);
          if (formData.imageFile) formDataToSend.append('image', formData.imageFile);
          
          await apiService.updateProduct(item.id, formDataToSend);
        } else {
          if (formData.imageFile) {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('price', formData.price);
            formDataToSend.append('categoryId', formData.categoryId);
            formDataToSend.append('image', formData.imageFile);
            
            await apiService.createProductWithImage(formDataToSend);
          } else {
            await apiService.createProduct({
              name: formData.name,
              description: formData.description || '',
              price: formData.price,
              categoryId: formData.categoryId,
            });
          }
        }
      } else if (section === 'categories') {
        if (item) {
          await apiService.updateCategory(item.id, formData);
        } else {
          await apiService.createCategory(formData);
        }
      } else if (section === 'inventory') {
        if (item) {
          await apiService.updateInventory(item.productId, { quantity: formData.quantity });
        }
      }
      
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getFields = () => {
    if (section === 'products') {
      return [
        { name: 'name', label: 'Product Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: false },
        { name: 'price', label: 'Price', type: 'number', required: true },
        { name: 'categoryId', label: 'Category', type: 'select', required: true },
      ];
    } else if (section === 'categories') {
      return [
        { name: 'name', label: 'Category Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: false },
      ];
    } else if (section === 'inventory') {
      return [
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      ];
    }
    return [];
  };

  const fields = getFields();
  const title = item ? `Update ${section}` : `Create New ${section.slice(0, -1)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {fields.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  disabled={isSubmitting}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  disabled={loadingCategories || isSubmitting}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  disabled={isSubmitting}
                />
              )}
            </div>
          ))}

          {section === 'products' && (
            <div className="image-section">
              <h4>Product Image</h4>
              <div className="image-type-selector">
                <label>
                  <input
                    type="radio"
                    name="imageType"
                    value="none"
                    checked={imageType === 'none'}
                    onChange={(e) => setImageType(e.target.value)}
                    disabled={isSubmitting}
                  />
                  No Image
                </label>
                <label>
                  <input
                    type="radio"
                    name="imageType"
                    value="upload"
                    checked={imageType === 'upload'}
                    onChange={(e) => setImageType(e.target.value)}
                    disabled={isSubmitting}
                  />
                  Upload Image
                </label>
                <label>
                  <input
                    type="radio"
                    name="imageType"
                    value="url"
                    checked={imageType === 'url'}
                    onChange={(e) => setImageType(e.target.value)}
                    disabled={isSubmitting}
                  />
                  Image URL
                </label>
              </div>

              {imageType === 'upload' && (
                <div className="form-group">
                  <label htmlFor="imageUpload">Choose Image File</label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {imageType === 'url' && (
                <div className="form-group">
                  <label htmlFor="imageUrl">Image URL</label>
                  <input
                    type="url"
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    onChange={handleImageUrlChange}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
