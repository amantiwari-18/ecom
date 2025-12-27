import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product details with tracking
        const productData = await apiService.getProductById(id, true);
        
        if (!productData) {
          throw new Error('Product not found');
        }
        
        // Process product data
        const processedProduct = {
          id: productData.id || id,
          name: productData.name || 'Unnamed Product',
          description: productData.description || 'No description available',
          price: productData.price || 0,
          originalPrice: productData.originalPrice || productData.price || 0,
          discount: productData.discount || 0,
          categoryId: productData.categoryId || '',
          category: productData.category || { id: '', name: 'Uncategorized' },
          image: productData.image || (productData.images && productData.images.length > 0 ? productData.images[0] : ''),
          images: productData.images || [],
          externalLinks: productData.externalLinks || [],
          availablePlatforms: productData.availablePlatforms || [],
          inStock: productData.inStock !== undefined ? productData.inStock : true,
          stockQuantity: productData.stockQuantity || 10,
          rating: productData.rating || 0,
          reviewCount: productData.reviewCount || 0,
          specifications: productData.specifications || {},
          isNew: productData.isNew || false,
          sku: productData.sku || '',
          localSale: productData.localSale || false,
          hits: productData.hits || 0,
          createdAt: productData.createdAt || new Date().toISOString()
        };
        
        setProduct(processedProduct);

        // Fetch similar products
        try {
          const similar = await apiService.getSimilarProducts(id, 4);
          setSimilarProducts(Array.isArray(similar) ? similar : []);
        } catch (simError) {
          console.log('Could not load similar products');
          setSimilarProducts([]);
        }

        // Fetch trending products
        try {
          const trending = await apiService.getTrendingProducts(4);
          setTrendingProducts(Array.isArray(trending) ? trending : []);
        } catch (trendError) {
          console.log('Could not load trending products');
          setTrendingProducts([]);
        }

        // Fetch analytics if available
        try {
          const analyticsData = await apiService.getProductAnalytics(id);
          setAnalytics(analyticsData);
        } catch (analyticsError) {
          console.log('Analytics not available');
        }

      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);

      // Check stock
      const stock = await apiService.checkStock(product.id, quantity);
      if (!stock.available) {
        showNotification(`${product.name} is out of stock!`);
        return;
      }

      // Add to cart
      const updatedCart = apiService.addToCart(product, quantity);
      showNotification(`${quantity} x ${product.name} added to cart!`);

    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  // Handle external purchase
  const handleExternalPurchase = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Show notification
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  };

  // Format price
  const formatPrice = (price) => {
    return apiService.formatPrice(price || 0);
  };

  // Calculate discounted price
  const getDiscountedPrice = () => {
    if (!product) return 0;
    if (product.discount && product.discount > 0) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-not-found">
        <div className="error-icon">⚠️</div>
        <h2>Product Not Found</h2>
        <p>{error || 'The product you are looking for does not exist.'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Products
        </button>
      </div>
    );
  }

  const discountedPrice = getDiscountedPrice();
  const isDiscounted = product.discount && product.discount > 0;
  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : [];
  const primaryExternalLink = product.externalLinks?.[0]?.url;

  return (
    <div className="product-detail-container">
      {/* Mobile Back Header */}
      {isMobile && (
        <div className="mobile-back-header">
          <button onClick={() => navigate(-1)} className="mobile-back-btn">
            ←
          </button>
          <h2 className="mobile-product-title">{product.name}</h2>
        </div>
      )}

      {/* Desktop Back Button */}
      {!isMobile && (
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Products
        </button>
      )}

      {/* Product Main Content */}
      <div className="product-detail-content">
        {/* Product Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            {images.length > 0 ? (
              <img 
                src={images[selectedImage]} 
                alt={`${product.name} - View ${selectedImage + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="no-image">📦</div>';
                }}
              />
            ) : (
              <div className="no-image">📦 No Image Available</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-container">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`} 
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="no-thumbnail">📦</div>';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Analytics Badge */}
          {analytics && (
            <div className="analytics-badge">
              <div className="analytics-item">
                <span className="analytics-label">👁️ Views:</span>
                <span className="analytics-value">{analytics.views || product.hits || 0}</span>
              </div>
              {analytics.purchases > 0 && (
                <div className="analytics-item">
                  <span className="analytics-label">🛒 Purchased:</span>
                  <span className="analytics-value">{analytics.purchases}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Product Header */}
          <div className="product-header">
            <h1>{product.name}</h1>
            <div className="product-meta">
              <span className="product-category">
                {product.category?.name || 'Uncategorized'}
              </span>
              {product.sku && (
                <span className="product-sku">SKU: {product.sku}</span>
              )}
              {product.hits > 0 && (
                <span className="product-views">👁️ {product.hits} views</span>
              )}
            </div>
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="rating-text">
                {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="price-section">
            <div className="current-price">
              {formatPrice(discountedPrice)}
            </div>
            
            {isDiscounted && (
              <div className="price-details">
                <span className="original-price">
                  {formatPrice(product.price)}
                </span>
                <span className="discount-percentage">
                  ({product.discount}% OFF)
                </span>
              </div>
            )}
            
            <div className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {product.inStock 
                ? `✅ In Stock ${product.stockQuantity ? `(${product.stockQuantity} available)` : ''}`
                : '❌ Out of Stock'
              }
            </div>
          </div>

          {/* Description */}
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="product-specifications">
              <h3>Specifications</h3>
              <div className="specs-grid">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-key">{key}:</span>
                    <span className="spec-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Platforms */}
          {product.availablePlatforms && product.availablePlatforms.length > 0 && (
            <div className="available-platforms">
              <h3>Available On</h3>
              <div className="platform-tags">
                {product.availablePlatforms.map((platform, index) => (
                  <span key={index} className="platform-tag">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          {product.externalLinks && product.externalLinks.length > 0 && (
            <div className="external-links">
              <h3>Buy From</h3>
              <div className="external-links-list">
                {product.externalLinks.filter(link => link && link.url).map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleExternalPurchase(link.url)}
                    className="external-link-btn"
                  >
                    🌐 {link.platform || 'External Site'}
                    {link.price && ` - ${formatPrice(link.price)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="product-actions">
            <div className="quantity-selector">
              <button 
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1 || !product.inStock}
                className="quantity-btn"
              >
                −
              </button>
              <span className="quantity-display">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange('increase')}
                disabled={!product.inStock || (product.stockQuantity && quantity >= product.stockQuantity)}
                className="quantity-btn"
              >
                +
              </button>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className={`add-to-cart-button ${!product.inStock ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock || addingToCart}
              >
                {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
              </button>
              
              <button 
                className="buy-now-button"
                onClick={handleBuyNow}
                disabled={!product.inStock || addingToCart}
              >
                Buy Now
              </button>
              
              {primaryExternalLink && (
                <button 
                  className="external-link-button"
                  onClick={() => handleExternalPurchase(primaryExternalLink)}
                  disabled={addingToCart}
                >
                  🌐 Buy on External Site
                </button>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <h3>📦 Delivery Information</h3>
            <ul>
              <li>🕒 Usually dispatches in 24 hours</li>
              <li>🚚 Free delivery on orders above ₹500</li>
              <li>🔄 7-day return policy</li>
              <li>🛡️ 1-year warranty</li>
              <li>💳 Cash on delivery available</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="similar-products">
          <h2>Similar Products</h2>
          <div className="similar-products-grid">
            {similarProducts.map(similarProduct => {
              const similarDiscountedPrice = similarProduct.discount > 0
                ? similarProduct.price * (1 - similarProduct.discount / 100)
                : similarProduct.price;
              
              return (
                <div 
                  key={similarProduct.id} 
                  className="similar-product-card"
                  onClick={() => navigate(`/product/${similarProduct.id}`)}
                >
                  <div className="similar-product-image">
                    {similarProduct.image ? (
                      <img 
                        src={similarProduct.image} 
                        alt={similarProduct.name} 
                        loading="lazy"
                      />
                    ) : (
                      <div className="similar-image-placeholder">📦</div>
                    )}
                  </div>
                  <div className="similar-product-info">
                    <h4>{similarProduct.name}</h4>
                    <div className="similar-product-price">
                      {formatPrice(similarDiscountedPrice)}
                    </div>
                    {similarProduct.discount > 0 && (
                      <div className="similar-product-discount">
                        Save {similarProduct.discount}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <div className="trending-products">
          <h2>🔥 Trending Now</h2>
          <div className="trending-products-grid">
            {trendingProducts.map(trendingProduct => (
              <div 
                key={trendingProduct.id} 
                className="trending-product-card"
                onClick={() => navigate(`/product/${trendingProduct.id}`)}
              >
                <div className="trending-product-image">
                  {trendingProduct.image ? (
                    <img 
                      src={trendingProduct.image} 
                      alt={trendingProduct.name} 
                      loading="lazy"
                    />
                  ) : (
                    <div className="trending-image-placeholder">🔥</div>
                  )}
                </div>
                <div className="trending-product-info">
                  <h4>{trendingProduct.name}</h4>
                  <div className="trending-product-price">
                    {formatPrice(trendingProduct.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Action Bar */}
      {isMobile && (
        <div className="mobile-action-bar">
          <div className="mobile-price-section">
            <div className="mobile-current-price">
              {formatPrice(discountedPrice)}
            </div>
            {isDiscounted && (
              <div className="mobile-original-price">
                {formatPrice(product.price)}
              </div>
            )}
          </div>
          <div className="mobile-action-buttons">
            <button 
              className="mobile-action-btn add-to-cart-mobile"
              onClick={handleAddToCart}
              disabled={!product.inStock || addingToCart}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className="mobile-action-btn buy-now-mobile"
              onClick={handleBuyNow}
              disabled={!product.inStock || addingToCart}
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;