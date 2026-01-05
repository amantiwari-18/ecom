import React, { useState } from 'react';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  
  const safeProduct = product || {};
  
  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹--';
    const formatted = String(price).replace(/[₹\s]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `₹${formatted}`;
  };
  
  const getDiscountPercentage = () => {
    const price = safeProduct.price || 0;
    const original = safeProduct.originalPrice || price;
    if (original > price && original > 0) {
      return Math.round(((original - price) / original) * 100);
    }
    return 0;
  };
  
  const getProductImage = () => {
    if (imageError) return 'https://via.placeholder.com/200';
    if (safeProduct.image) return safeProduct.image;
    if (safeProduct.images?.[0]) return safeProduct.images[0];
    return 'https://via.placeholder.com/200';
  };
  
  const discountPercentage = getDiscountPercentage();
  const hasDiscount = discountPercentage > 0;
  const currentPrice = safeProduct.price || 0;
  const originalPrice = safeProduct.originalPrice || currentPrice;
  const purchaseCount = safeProduct.purchaseCount || 0;
  
  const getPurchaseInfo = () => {
    if (!purchaseCount) return '';
    if (purchaseCount >= 1000) {
      return `${Math.floor(purchaseCount / 1000)}k+ bought in past month`;
    }
    return `${purchaseCount}+ bought in past month`;
  };
  
  const getProductName = () => {
    const name = safeProduct.name || 'Product Name';
    if (name.length > 35) {
      return `${name.substring(0, 35)}...`;
    }
    return name;
  };
  
  return (
    <div className="max-w-xs mx-auto">
      <div className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative">
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-tl-lg rounded-br-lg z-10">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Image Container */}
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 h-56 flex items-center justify-center p-4">
          <img 
            src={getProductImage()} 
            alt={safeProduct.name}
            className="max-w-full max-h-full object-contain"
            onError={() => setImageError(true)}
          />
          {/* Add to Cart Button - Bottom Right */}
          <button className="absolute bottom-3 right-3 bg-yellow-400 hover:bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-colors">
            <span className="text-xl font-bold leading-none">+</span>
          </button>
        </div>
        
        {/* Product Info */}
        <div className="p-3">
          {/* Product Name */}
          <h3 className="text-sm text-gray-900 mb-2 line-clamp-2 h-10">
            {getProductName()}
          </h3>
          
          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          
          {/* Free Delivery */}
          <div className="text-sm text-green-600 mb-1">
            FREE delivery
          </div>
          
          {/* Purchase Info */}
          {getPurchaseInfo() && (
            <div className="text-xs text-gray-500">
              {getPurchaseInfo()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;