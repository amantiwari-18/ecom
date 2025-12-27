import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api.service';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  
  // State
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});
  const [stockErrors, setStockErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [shippingFee, setShippingFee] = useState(0);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = apiService.getCart();
    setCartItems(cart);
    checkStockForAllItems(cart);
  };

  // Check stock for all items
  const checkStockForAllItems = async (items) => {
    const errors = {};
    
    for (const item of items) {
      try {
        const stock = await apiService.checkStock(item.productId, item.quantity);
        if (!stock.available) {
          errors[item.productId] = `Only ${stock.stockQuantity} available`;
        }
      } catch (error) {
        errors[item.productId] = 'Stock check failed';
      }
    }
    
    setStockErrors(errors);
  };

  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      // Check stock
      const stock = await apiService.checkStock(productId, newQuantity);
      if (!stock.available) {
        setStockErrors(prev => ({
          ...prev,
          [productId]: `Only ${stock.stockQuantity} available`
        }));
        return;
      }

      // Update cart
      const updatedCart = apiService.updateCartItemQuantity(productId, newQuantity);
      setCartItems(updatedCart);
      
      // Clear stock error for this item
      setStockErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[productId];
        return newErrors;
      });

    } catch (error) {
      console.error('Error updating quantity:', error);
      showNotification('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Remove item from cart
  const handleRemoveItem = (productId) => {
    const updatedCart = apiService.removeFromCart(productId);
    setCartItems(updatedCart);
    
    // Remove stock error
    setStockErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[productId];
      return newErrors;
    });
    
    showNotification('Item removed from cart');
  };

  // Apply coupon
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Mock coupon validation
    const validCoupons = {
      'SAVE10': { discount: 10, type: 'percentage' },
      'WELCOME20': { discount: 20, type: 'percentage', maxDiscount: 500 },
      'FREESHIP': { discount: 0, type: 'shipping', shippingFree: true }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponError('');
      
      if (coupon.shippingFree) {
        setShippingFee(0);
      }
      
      showNotification('Coupon applied successfully!');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountedPrice || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = calculateSubtotal();
    
    if (appliedCoupon.type === 'percentage') {
      let discount = (subtotal * appliedCoupon.discount) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
      return discount;
    }
    
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount + shippingFee;
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

  // Handle checkout
  const handleCheckout = () => {
    // Check for stock errors
    const hasStockErrors = Object.keys(stockErrors).length > 0;
    if (hasStockErrors) {
      showNotification('Please resolve stock issues before checkout');
      return;
    }

    if (cartItems.length === 0) {
      showNotification('Your cart is empty');
      return;
    }

    navigate('/checkout');
  };

  // Continue shopping
  const continueShopping = () => {
    navigate('/');
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <button onClick={continueShopping} className="continue-shopping-btn">
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const total = calculateTotal();
  const hasStockErrors = Object.keys(stockErrors).length > 0;

  return (
    <div className="cart-page">
      <h1>Shopping Cart ({cartItems.length} items)</h1>
      
      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.map(item => {
            const price = item.discountedPrice || item.price || 0;
            const subtotal = price * item.quantity;
            const stockError = stockErrors[item.productId];
            const isUpdating = updating[item.productId];
            
            return (
              <div key={`${item.productId}_${item.id}`} className="cart-item">
                {/* Product Image */}
                <div 
                  className="cart-item-image"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="cart-item-no-image">📦</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <h3 
                      className="cart-item-name"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.name}
                    </h3>
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={isUpdating}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Stock Error */}
                  {stockError && (
                    <div className="stock-error">
                      ⚠️ {stockError}
                    </div>
                  )}

                  {/* Price and Quantity */}
                  <div className="cart-item-details">
                    <div className="cart-item-price">
                      <span className="current-price">{formatPrice(price)}</span>
                      {item.discountedPrice && item.price && (
                        <span className="original-price">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>

                    <div className="cart-item-quantity">
                      <button 
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        className="quantity-btn minus"
                      >
                        −
                      </button>
                      
                      <span className="quantity-display">
                        {isUpdating ? '...' : item.quantity}
                      </span>
                      
                      <button 
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={isUpdating}
                        className="quantity-btn plus"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-subtotal">
                      {formatPrice(subtotal)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continue Shopping Button */}
          <div className="cart-actions">
            <button onClick={continueShopping} className="continue-shopping">
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
            </div>
            
            {appliedCoupon && (
              <div className="summary-row discount-row">
                <span>Discount ({appliedCoupon.discount}% off)</span>
                <span className="discount-amount">-{formatPrice(discount)}</span>
              </div>
            )}
            
            <div className="summary-row total-row">
              <span>Total</span>
              <span className="total-amount">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="coupon-input"
            />
            <button onClick={handleApplyCoupon} className="apply-coupon-btn">
              Apply
            </button>
            {couponError && (
              <div className="coupon-error">{couponError}</div>
            )}
            {appliedCoupon && (
              <div className="coupon-success">
                ✓ Coupon applied: {appliedCoupon.discount}% off
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button 
            onClick={handleCheckout}
            disabled={hasStockErrors || loading}
            className={`checkout-btn ${hasStockErrors ? 'disabled' : ''}`}
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>

          {/* Security Info */}
          <div className="security-info">
            <div className="security-item">🔒 Secure checkout</div>
            <div className="security-item">🛡️ 7-day return policy</div>
            <div className="security-item">📦 Free shipping on orders above ₹500</div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <span>We accept:</span>
            <div className="payment-icons">
              <span>💳</span>
              <span>🏦</span>
              <span>📱</span>
              <span>💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed (Optional) */}
      <div className="recently-viewed">
        <h3>You might also like</h3>
        <button onClick={continueShopping} className="browse-more-btn">
          Browse More Products →
        </button>
      </div>
    </div>
  );
};

export default CartPage;