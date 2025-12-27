import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  
  // State
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Shipping, 3: Payment, 4: Review
  const [formData, setFormData] = useState({
    // Address
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    
    // Shipping
    shippingMethod: 'standard',
    
    // Payment
    paymentMethod: 'cod',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    
    // Order notes
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Load cart
  useEffect(() => {
    const cart = apiService.getCart();
    setCartItems(cart);
    
    // Load user data if available
    const user = apiService.getCurrentUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    switch (step) {
      case 1: // Address
        if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Phone is invalid';
        if (!formData.line1.trim()) newErrors.line1 = 'Address line 1 is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        break;

      case 2: // Shipping
        // Shipping method is always selected
        break;

      case 3: // Payment
        if (formData.paymentMethod === 'card') {
          if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
          else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) 
            newErrors.cardNumber = 'Card number is invalid';
          if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
          if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
          if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
          else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'CVV is invalid';
        } else if (formData.paymentMethod === 'upi') {
          if (!formData.upiId.trim()) newErrors.upiId = 'UPI ID is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.discountedPrice || item.price || 0;
      return total + (price * item.quantity);
    }, 0);

    const shippingFee = formData.shippingMethod === 'express' ? 99 : 
                       formData.shippingMethod === 'overnight' ? 199 : 49;

    const total = subtotal + shippingFee;
    
    return { subtotal, shippingFee, total };
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!validateStep()) return;

    setLoading(true);
    
    try {
      // Prepare order data
      const { subtotal, shippingFee, total } = calculateTotals();
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: {
          fullName: formData.fullName,
          line1: formData.line1,
          line2: formData.line2 || '',
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email
        },
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        totalAmount: total,
        discountAmount: 0, // You can add coupon logic here
        shippingAmount: shippingFee,
        finalAmount: total,
        notes: formData.notes || ''
      };

      // Create order
      const order = await apiService.createOrder(orderData);
      setOrderDetails(order);
      
      // Clear cart
      apiService.clearCart();
      setCartItems([]);
      
      // Move to success step
      setOrderPlaced(true);
      setStep(5);

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const { subtotal, shippingFee, total } = calculateTotals();

  // Step 5: Order Success
  if (orderPlaced && orderDetails) {
    return (
      <div className="order-success">
        <div className="success-icon">🎉</div>
        <h1>Order Placed Successfully!</h1>
        <div className="order-summary-card">
          <h3>Order Details</h3>
          <div className="order-details">
            <div className="detail-row">
              <span>Order Number:</span>
              <strong>{orderDetails.orderNumber}</strong>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <strong>{formatPrice(orderDetails.finalAmount)}</strong>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>{orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
            <div className="detail-row">
              <span>Estimated Delivery:</span>
              <span>3-5 business days</span>
            </div>
          </div>
          <p className="confirmation-email">
            A confirmation email has been sent to {formData.email}
          </p>
        </div>
        <div className="success-actions">
          <button onClick={() => navigate('/orders')} className="view-orders-btn">
            View My Orders
          </button>
          <button onClick={() => navigate('/')} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      {/* Progress Steps */}
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Address</div>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Shipping</div>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Payment</div>
        </div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Review</div>
        </div>
      </div>

      <div className="checkout-container">
        {/* Left Column: Forms */}
        <div className="checkout-form">
          {step === 1 && (
            <div className="form-step">
              <h2>Shipping Address</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Address Line 1 *</label>
                  <input
                    type="text"
                    name="line1"
                    value={formData.line1}
                    onChange={handleInputChange}
                    className={errors.line1 ? 'error' : ''}
                    placeholder="House no., Building, Street"
                  />
                  {errors.line1 && <span className="error-message">{errors.line1}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    name="line2"
                    value={formData.line2}
                    onChange={handleInputChange}
                    placeholder="Area, Landmark"
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={errors.state ? 'error' : ''}
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={errors.postalCode ? 'error' : ''}
                  />
                  {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Shipping Method</h2>
              <div className="shipping-options">
                <label className={`shipping-option ${formData.shippingMethod === 'standard' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={formData.shippingMethod === 'standard'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-title">Standard Delivery</span>
                    <span className="option-details">3-5 business days</span>
                    <span className="option-price">{formatPrice(49)}</span>
                  </div>
                </label>

                <label className={`shipping-option ${formData.shippingMethod === 'express' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={formData.shippingMethod === 'express'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-title">Express Delivery</span>
                    <span className="option-details">1-2 business days</span>
                    <span className="option-price">{formatPrice(99)}</span>
                  </div>
                </label>

                <label className={`shipping-option ${formData.shippingMethod === 'overnight' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="overnight"
                    checked={formData.shippingMethod === 'overnight'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-title">Overnight Delivery</span>
                    <span className="option-details">Next business day</span>
                    <span className="option-price">{formatPrice(199)}</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-title">Cash on Delivery</span>
                    <span className="option-details">Pay when you receive</span>
                  </div>
                </label>

                <label className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-title">Credit/Debit Card</span>
                    <span className="option-details">Visa, MasterCard, RuPay</span>
                  </div>
                </label>

                <label className={`payment-option ${formData.paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleInputChange}
                  />
                  <div className="option-content">
                    <span className="option-title">UPI</span>
                    <span className="option-details">Google Pay, PhonePe, Paytm</span>
                  </div>
                </label>
              </div>

              {/* Card Details */}
              {formData.paymentMethod === 'card' && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label>Name on Card *</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={errors.cardName ? 'error' : ''}
                    />
                    {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className={errors.expiryDate ? 'error' : ''}
                      />
                      {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                    </div>

                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className={errors.cvv ? 'error' : ''}
                      />
                      {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Details */}
              {formData.paymentMethod === 'upi' && (
                <div className="upi-details">
                  <div className="form-group">
                    <label>UPI ID *</label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="yourname@upi"
                      className={errors.upiId ? 'error' : ''}
                    />
                    {errors.upiId && <span className="error-message">{errors.upiId}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="form-step">
              <h2>Review Your Order</h2>
              
              {/* Order Summary */}
              <div className="review-summary">
                <div className="review-section">
                  <h3>Shipping Address</h3>
                  <p>{formData.fullName}</p>
                  <p>{formData.line1}</p>
                  {formData.line2 && <p>{formData.line2}</p>}
                  <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                  <p>{formData.country}</p>
                  <p>Phone: {formData.phone}</p>
                  <p>Email: {formData.email}</p>
                  <button 
                    onClick={() => setStep(1)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                </div>

                <div className="review-section">
                  <h3>Shipping Method</h3>
                  <p>
                    {formData.shippingMethod === 'standard' && 'Standard Delivery (3-5 days)'}
                    {formData.shippingMethod === 'express' && 'Express Delivery (1-2 days)'}
                    {formData.shippingMethod === 'overnight' && 'Overnight Delivery'}
                  </p>
                  <button 
                    onClick={() => setStep(2)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                </div>

                <div className="review-section">
                  <h3>Payment Method</h3>
                  <p>
                    {formData.paymentMethod === 'cod' && 'Cash on Delivery'}
                    {formData.paymentMethod === 'card' && 'Credit/Debit Card'}
                    {formData.paymentMethod === 'upi' && 'UPI'}
                  </p>
                  <button 
                    onClick={() => setStep(3)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                </div>

                {/* Order Notes */}
                <div className="form-group full-width">
                  <label>Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Special instructions for your order..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="checkout-navigation">
            {step > 1 && step < 5 && (
              <button onClick={handlePrevious} className="back-btn">
                ← Back
              </button>
            )}
            
            {step < 4 && (
              <button onClick={handleNext} className="next-btn">
                Continue →
              </button>
            )}
            
            {step === 4 && (
              <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="place-order-btn"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="order-summary-sidebar">
          <h2>Order Summary</h2>
          
          {/* Cart Items */}
          <div className="checkout-items">
            {cartItems.map(item => {
              const price = item.discountedPrice || item.price || 0;
              return (
                <div key={item.productId} className="checkout-item">
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <div className="item-price">
                      {formatPrice(price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="item-subtotal">
                    {formatPrice(price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="checkout-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Security Info */}
          <div className="security-notice">
            <div className="security-item">🔒 Secure SSL encryption</div>
            <div className="security-item">🛡️ Your data is protected</div>
            <div className="security-item">💳 We don't store card details</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;