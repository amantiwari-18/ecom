import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  fullscreen = false, 
  size = 'medium',
  color = 'primary',
  text = 'Loading...',
  overlay = false 
}) => {
  // Size classes
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
    xlarge: 'spinner-xlarge'
  }[size];
  
  // Color classes
  const colorClass = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    light: 'spinner-light',
    dark: 'spinner-dark'
  }[color];
  
  // Render fullscreen spinner
  if (fullscreen) {
    return (
      <div className="loading-spinner-fullscreen">
        <div className="spinner-container">
          <div className={`spinner ${sizeClass} ${colorClass}`}>
            <div className="spinner-inner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
            </div>
          </div>
          {text && <p className="spinner-text">{text}</p>}
        </div>
      </div>
    );
  }
  
  // Render overlay spinner
  if (overlay) {
    return (
      <div className="loading-spinner-overlay">
        <div className="spinner-container">
          <div className={`spinner ${sizeClass} ${colorClass}`}>
            <div className="spinner-inner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
            </div>
          </div>
          {text && <p className="spinner-text">{text}</p>}
        </div>
      </div>
    );
  }
  
  // Render inline spinner
  return (
    <div className="loading-spinner-inline">
      <div className={`spinner ${sizeClass} ${colorClass}`}>
        <div className="spinner-inner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

// Skeleton Loader Component
export const SkeletonLoader = ({ 
  type = 'card',
  count = 1,
  height 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-line long"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div className="skeleton-text">
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '60%' }}></div>
            <div className="skeleton-line" style={{ width: '90%' }}></div>
          </div>
        );
        
      case 'image':
        return <div className="skeleton-image" style={{ height }}></div>;
        
      case 'list':
        return (
          <div className="skeleton-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-list-item">
                <div className="skeleton-circle"></div>
                <div className="skeleton-line" style={{ width: `${70 + i * 5}%` }}></div>
              </div>
            ))}
          </div>
        );
        
      default:
        return <div className="skeleton-box" style={{ height }}></div>;
    }
  };
  
  if (count > 1) {
    return (
      <div className="skeleton-container">
        {[...Array(count)].map((_, i) => (
          <React.Fragment key={i}>
            {renderSkeleton()}
          </React.Fragment>
        ))}
      </div>
    );
  }
  
  return renderSkeleton();
};

export default LoadingSpinner;