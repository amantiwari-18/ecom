import React, { useState, useEffect, useRef } from 'react';
import * as apiService from '../services/api.service';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only fetch once on component mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const fetchData = async () => {
        try {
          setLoading(true);
          const [productsResponse, categoriesResponse] = await Promise.all([
            apiService.getProducts(),
            apiService.getCategories()
          ]);
          setProducts(productsResponse.data);
          setCategories(categoriesResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart!`);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Browse Products</h1>
          <div className="cart-badge">
            🛒 Cart ({cart.length})
          </div>
        </div>

        <div className="filter-section">
          <h3>Filter by Category</h3>
          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const imageUrl = getProductImage(product);
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">
                        📦 No Image
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-category">
                      Category: <span>{categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}</span>
                    </p>
                    <p className="product-description">
                      {product.description || 'No description available'}
                    </p>
                    <div className="product-footer">
                      <div className="price">₹{product.price}</div>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
