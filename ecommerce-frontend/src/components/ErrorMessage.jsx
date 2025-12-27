import React, { useState } from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message = 'Something went wrong',
  details,
  code,
  onRetry,
  onClose,
  type = 'error',
  showIcon = true,
  showAction = true,
  fullWidth = false,
  dismissible = true 
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Type configurations
  const typeConfig = {
    error: {
      icon: 'exclamation-circle',
      title: 'Error',
      className: 'error',
      bgColor: '#fee',
      borderColor: '#f5c6cb',
      textColor: '#721c24'
    },
    warning: {
      icon: 'exclamation-triangle',
      title: 'Warning',
      className: 'warning',
      bgColor: '#fff3cd',
      borderColor: '#ffeaa7',
      textColor: '#856404'
    },
    info: {
      icon: 'info-circle',
      title: 'Information',
      className: 'info',
      bgColor: '#d1ecf1',
      borderColor: '#bee5eb',
      textColor: '#0c5460'
    },
    success: {
      icon: 'check-circle',
      title: 'Success',
      className: 'success',
      bgColor: '#d4edda',
      borderColor: '#c3e6cb',
      textColor: '#155724'
    },
    network: {
      icon: 'wifi-slash',
      title: 'Connection Error',
      className: 'network',
      bgColor: '#fff3cd',
      borderColor: '#ffeaa7',
      textColor: '#856404'
    }
  };
  
  const config = typeConfig[type] || typeConfig.error;
  
  // Handle close
  const handleClose = () => {
    setIsDismissed(true);
    if (onClose) {
      onClose();
    }
  };
  
  // Handle retry
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };
  
  // If dismissed, don't render
  if (isDismissed && dismissible) {
    return null;
  }
  
  // Common errors with suggestions
  const getErrorSuggestions = () => {
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('connection')) {
      return (
        <ul className="error-suggestions">
          <li>Check your internet connection</li>
          <li>Try refreshing the page</li>
          <li>Wait a few minutes and try again</li>
        </ul>
      );
    }
    
    if (message.toLowerCase().includes('not found') || code === 404) {
      return (
        <ul className="error-suggestions">
          <li>The resource you're looking for might have been moved</li>
          <li>Check the URL for errors</li>
          <li>Return to the homepage</li>
        </ul>
      );
    }
    
    if (message.toLowerCase().includes('server') || code === 500) {
      return (
        <ul className="error-suggestions">
          <li>Server might be temporarily unavailable</li>
          <li>Try again in a few minutes</li>
          <li>Contact support if the problem persists</li>
        </ul>
      );
    }
    
    return null;
  };
  
  const suggestions = getErrorSuggestions();
  
  // Render full page error
  if (fullWidth) {
    return (
      <div className={`error-message-fullpage ${config.className}`}>
        <div className="error-content">
          {showIcon && (
            <div className="error-icon">
              <i className={`fas fa-${config.icon} fa-4x`}></i>
            </div>
          )}
          
          <div className="error-text">
            <h2 className="error-title">{config.title}</h2>
            <p className="error-message">{message}</p>
            
            {code && (
              <div className="error-code">
                <small>Error Code: {code}</small>
              </div>
            )}
            
            {details && (
              <details className="error-details">
                <summary>Details</summary>
                <pre>{details}</pre>
              </details>
            )}
            
            {suggestions}
          </div>
          
          {showAction && (
            <div className="error-actions">
              {onRetry && (
                <button className="retry-btn" onClick={handleRetry}>
                  <i className="fas fa-redo"></i> Try Again
                </button>
              )}
              
              <button 
                className="home-btn" 
                onClick={() => window.location.href = '/'}
              >
                <i className="fas fa-home"></i> Go Home
              </button>
              
              {dismissible && (
                <button className="close-btn" onClick={handleClose}>
                  <i className="fas fa-times"></i> Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render inline error
  return (
    <div 
      className={`error-message ${config.className} ${dismissible ? 'dismissible' : ''}`}
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        color: config.textColor
      }}
    >
      <div className="error-header">
        {showIcon && (
          <i className={`fas fa-${config.icon} error-icon`}></i>
        )}
        
        <div className="error-text-content">
          <strong className="error-title">{config.title}:</strong>
          <span className="error-message-text">{message}</span>
          
          {code && (
            <small className="error-code-text"> (Code: {code})</small>
          )}
        </div>
        
        {dismissible && (
          <button 
            className="error-close-btn" 
            onClick={handleClose}
            aria-label="Close error message"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      {details && (
        <details className="error-details-inline">
          <summary>Show Details</summary>
          <pre>{details}</pre>
        </details>
      )}
      
      {suggestions && (
        <div className="error-suggestions-inline">
          {suggestions}
        </div>
      )}
      
      {showAction && onRetry && (
        <div className="error-actions-inline">
          <button 
            className="error-retry-btn" 
            onClick={handleRetry}
            style={{
              backgroundColor: config.textColor,
              color: config.bgColor
            }}
          >
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      )}
    </div>
  );
};

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to analytics service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          message={this.state.error?.message || 'Something went wrong'}
          details={this.state.errorInfo?.componentStack}
          type="error"
          onRetry={this.handleReset}
          fullWidth={true}
          showAction={true}
        />
      );
    }
    
    return this.props.children;
  }
}

// Network Status Indicator
export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <ErrorMessage
      type="network"
      message="You are currently offline. Some features may not be available."
      showIcon={true}
      showAction={false}
      dismissible={false}
      fullWidth={false}
    />
  );
};

export default ErrorMessage;