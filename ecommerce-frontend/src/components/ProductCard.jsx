import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import './ProductCard.css';

const ProductCard = ({ 
  product, 
  compact = false, 
  showPlatforms = true,
  showStock = true,
  showCategory = false,
  showActions = true 
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Safely get product data with defaults
  const safeProduct = product || {};
  
  // Format price
  const formatPrice = (price) => {
    return apiService.formatPrice(price || 0);
  };
  
  // Get discounted price
  const getDiscountedPrice = () => {
    if (safeProduct.discount && safeProduct.discount > 0) {
      return safeProduct.price * (1 - safeProduct.discount / 100);
    }
    return safeProduct.price || 0;
  };
  
  // Calculate discount percentage
  const calculateDiscountPercentage = () => {
    if (safeProduct.discount) {
      return safeProduct.discount;
    }
    if (safeProduct.originalPrice && safeProduct.originalPrice > safeProduct.price) {
      return Math.round(((safeProduct.originalPrice - safeProduct.price) / safeProduct.originalPrice) * 100);
    }
    return 0;
  };
  
  // Get product image
  const getProductImage = () => {
    if (imageError) {
      return '/placeholder-image.jpg';
    }
    if (safeProduct.image) {
      return safeProduct.image;
    }
    if (safeProduct.images && safeProduct.images.length > 0) {
      return safeProduct.images[0];
    }
    return '/placeholder-image.jpg';
  };
  
  // Get product rating stars
  const getRatingStars = () => {
    if (!safeProduct.rating) return null;
    
    const rating = Math.min(5, Math.max(0, safeProduct.rating));
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<i key={i} className="fas fa-star filled"></i>);
      } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
        stars.push(<i key={i} className="fas fa-star-half-alt filled"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    
    return stars;
  };
  
  // Handle product click
  const handleProductClick = () => {
    navigate(`/product/${safeProduct.id}`);
  };
  
  // Handle add to cart
  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const cartItems = apiService.addToCart(safeProduct, 1);
      
      // Show success notification
      const event = new CustomEvent('showNotification', {
        detail: {
          type: 'success',
          message: `${safeProduct.name} added to cart!`,
          duration: 3000
        }
      });
      window.dispatchEvent(event);
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cartItems }));
      
    } catch (error) {
      const event = new CustomEvent('showNotification', {
        detail: {
          type: 'error',
          message: 'Failed to add to cart',
          duration: 3000
        }
      });
      window.dispatchEvent(event);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };
  
  // Handle external link click
  const handleExternalLinkClick = (e, platform) => {
    e.stopPropagation();
    
    if (safeProduct.externalLinks && safeProduct.externalLinks.length > 0) {
      const link = safeProduct.externalLinks.find(l => l.platform === platform);
      if (link && link.url) {
        window.open(link.url, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    
    // Fallback to generic search
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(safeProduct.name + ' ' + platform)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };
  
  // Handle quick view
  const handleQuickView = (e) => {
    e.stopPropagation();
    
    const event = new CustomEvent('showQuickView', {
      detail: { productId: safeProduct.id }
    });
    window.dispatchEvent(event);
  };
  
  // Determine stock status
  const getStockStatus = () => {
    if (safeProduct.inStock === false) {
      return { text: 'Out of Stock', className: 'out-of-stock' };
    }
    if (safeProduct.stockQuantity <= 0) {
      return { text: 'Out of Stock', className: 'out-of-stock' };
    }
    if (safeProduct.stockQuantity < 10) {
      return { text: `Only ${safeProduct.stockQuantity} left`, className: 'low-stock' };
    }
    return { text: 'In Stock', className: 'in-stock' };
  };
  
  const stockStatus = getStockStatus();
  const discountPercentage = calculateDiscountPercentage();
  const discountedPrice = getDiscountedPrice();
  const hasDiscount = discountPercentage > 0;
  const ratingStars = getRatingStars();
  const productImage = getProductImage();
  
  // Get safe description
  const getSafeDescription = () => {
    const description = safeProduct.description || '';
    if (description.length > 80) {
      return `${description.substring(0, 80)}...`;
    }
    return description || 'No description available';
  };
  
  // Get safe name
  const getSafeName = () => {
    const name = safeProduct.name || 'Unnamed Product';
    if (name.length > 50) {
      return `${name.substring(0, 50)}...`;
    }
    return name;
  };
  
  // Compact view
  if (compact) {
    return (
      <div className="product-card compact" onClick={handleProductClick}>
        <div className="product-image">
          <img 
            src={productImage} 
            alt={safeProduct.name || 'Product'}
            onError={() => setImageError(true)}
          />
          {hasDiscount && (
            <span className="discount-badge">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-title">{getSafeName()}</h3>
          <div className="price-section">
            <span className="current-price">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="original-price">{formatPrice(safeProduct.price)}</span>
            )}
          </div>
          {showStock && (
            <div className={`stock-status ${stockStatus.className}`}>
              {stockStatus.text}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Full view
  return (
    <div className="product-card" onClick={handleProductClick}>
      {/* Product Image */}
      <div className="product-image">
        <img 
          src={productImage} 
          alt={safeProduct.name || 'Product'}
          onError={() => setImageError(true)}
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="discount-badge">
            {discountPercentage}% OFF
          </span>
        )}
        
        {/* Quick View Button */}
        <button 
          className="quick-view-btn" 
          onClick={handleQuickView}
          title="Quick View"
        >
          <i className="fas fa-eye"></i>
        </button>
        
        {/* New Arrival Badge */}
        {safeProduct.isNew && (
          <span className="new-badge">NEW</span>
        )}
        
        {/* Popular Badge */}
        {safeProduct.hits && safeProduct.hits > 1000 && (
          <span className="popular-badge">
            <i className="fas fa-fire"></i> Popular
          </span>
        )}
      </div>
      
      {/* Product Info */}
      <div className="product-info">
        {/* Category */}
        {showCategory && safeProduct.categoryName && (
          <div className="product-category">
            {safeProduct.categoryName}
          </div>
        )}
        
        {/* Title */}
        <h3 className="product-title" title={safeProduct.name}>
          {getSafeName()}
        </h3>
        
        {/* Description */}
        <p className="product-description">
          {getSafeDescription()}
        </p>
        
        {/* Rating */}
        {safeProduct.rating && (
          <div className="product-rating">
            <div className="stars">
              {ratingStars}
              <span className="rating-value">{safeProduct.rating.toFixed(1)}</span>
            </div>
            {safeProduct.reviewCount && (
              <span className="review-count">({safeProduct.reviewCount})</span>
            )}
          </div>
        )}
        
        {/* Price */}
        <div className="price-section">
          <div className="price-display">
            <span className="current-price">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="original-price">{formatPrice(safeProduct.price)}</span>
            )}
          </div>
          {safeProduct.hits && safeProduct.hits > 0 && (
            <div className="view-count">
              <i className="fas fa-eye"></i> {safeProduct.hits.toLocaleString()}
            </div>
          )}
        </div>
        
        {/* Stock Status */}
        {showStock && (
          <div className={`stock-status ${stockStatus.className}`}>
            <i className="fas fa-circle"></i> {stockStatus.text}
          </div>
        )}
        
        {/* Platforms */}
        {showPlatforms && safeProduct.availablePlatforms && safeProduct.availablePlatforms.length > 0 && (
          <div className="platforms">
            <span className="platforms-label">Available on:</span>
            <div className="platform-icons">
              {safeProduct.availablePlatforms.slice(0, 3).map(platform => (
                <span 
                  key={platform} 
                  className="platform-icon"
                  title={`View on ${platform}`}
                  onClick={(e) => handleExternalLinkClick(e, platform)}
                >
                  {platform.charAt(0)}
                </span>
              ))}
              {safeProduct.availablePlatforms.length > 3 && (
                <span className="platform-more" title="More platforms">
                  +{safeProduct.availablePlatforms.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="product-actions">
            <button 
              className={`add-to-cart-btn ${isLoading ? 'loading' : ''}`}
              onClick={handleAddToCart}
              disabled={isLoading || stockStatus.className === 'out-of-stock'}
              title={stockStatus.className === 'out-of-stock' ? 'Out of Stock' : 'Add to Cart'}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : stockStatus.className === 'out-of-stock' ? (
                'Out of Stock'
              ) : (
                <>
                  <i className="fas fa-shopping-cart"></i>
                  Add to Cart
                </>
              )}
            </button>
            
            <button 
              className="buy-now-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (stockStatus.className !== 'out-of-stock') {
                  handleAddToCart(e);
                  setTimeout(() => navigate('/checkout'), 100);
                }
              }}
              disabled={stockStatus.className === 'out-of-stock'}
              title="Buy Now"
            >
              <i className="fas fa-bolt"></i>
              Buy Now
            </button>
          </div>
        )}
        
        {/* External Links Quick Access */}
        {safeProduct.externalLinks && safeProduct.externalLinks.length > 0 && (
          <div className="external-links">
            {safeProduct.externalLinks.slice(0, 2).map((link, index) => (
              <button
                key={index}
                className="external-link-btn"
                onClick={(e) => handleExternalLinkClick(e, link.platform)}
                title={`Buy on ${link.platform} for ${formatPrice(link.price || safeProduct.price)}`}
              >
                {link.platform}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;