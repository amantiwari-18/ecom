import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api.service';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    platforms: [],
    sortBy: 'newest',
    page: 1,
    limit: 12,
    includeHits: false
  });
  
  // Categories
  const [categories, setCategories] = useState([]);
  
  // Platform options
  const platformOptions = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Snapdeal', 'ShopClues'];
  
  // Debounce timer
  const searchDebounceTimer = useRef(null);
  // Track if we've already loaded
  const hasLoadedRef = useRef(false);
  
  // Parse URL parameters - ONLY ONCE on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    const params = new URLSearchParams(location.search);
    const parsedFilters = {
      search: params.get('search') || '',
      category: params.get('category') || '',
      minPrice: params.get('minPrice') ? parseFloat(params.get('minPrice')) : '',
      maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')) : '',
      inStock: params.get('inStock') === 'true',
      localSale: params.get('localSale') === 'true',
      hasExternalLinks: params.get('hasExternalLinks') === 'true',
      isNew: params.get('isNew') === 'true',
      platforms: params.getAll('platforms') || [],
      sortBy: params.get('sortBy') || 'newest',
      page: parseInt(params.get('page') || '1'),
      limit: 12,
      includeHits: false
    };
    
    // console.log('Parsed URL filters:', parsedFilters);
    setFilters(parsedFilters);
    hasLoadedRef.current = true;
  }, [location.search]);
  
  // Load categories - ONLY ONCE on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // console.log('Loading categories...');
        const categoriesData = await apiService.getCategories();
        // console.log('Categories loaded:', categoriesData);
        setCategories(categoriesData);
      } catch (err) {
        // console.error('Error loading categories:', err);
        setCategories([]);
      }
    };
    
    loadCategories();
  }, []); // Empty dependency array - run only once
  
  // Load products - ONLY when filters change
  useEffect(() => {
    const loadProducts = async () => {
      // Don't load if it's initial mount (we'll load after URL parsing)
      if (initialLoad) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Clean filters - convert empty strings to undefined
        const cleanFilters = { ...filters };
        if (cleanFilters.minPrice === '') delete cleanFilters.minPrice;
        if (cleanFilters.maxPrice === '') delete cleanFilters.maxPrice;
        if (cleanFilters.search === '') delete cleanFilters.search;
        if (cleanFilters.category === '') delete cleanFilters.category;
        
        // console.log('Loading products with filters:', cleanFilters);
        
        const response = await apiService.getProducts(cleanFilters);
        // console.log('API Response received:', response);
        
        if (response && response.data) {
          setProducts(response.data);
          setPagination(response.pagination || {
            page: cleanFilters.page || 1,
            limit: cleanFilters.limit || 12,
            total: response.data.length,
            totalPages: Math.ceil(response.data.length / (cleanFilters.limit || 12)),
            hasNext: false,
            hasPrev: false
          });
        } else {
          // console.warn('No products data in response');
          setProducts([]);
          setPagination({
            page: cleanFilters.page || 1,
            limit: cleanFilters.limit || 12,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          });
        }
        
        // Update URL for sharing
        const params = new URLSearchParams();
        Object.entries(cleanFilters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(key, item));
          } else if (value !== '' && value !== null && value !== undefined) {
            params.append(key, String(value));
          }
        });
        
        navigate(`?${params.toString()}`, { replace: true });
        
      } catch (err) {
        // console.error('Error loading products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [filters, navigate, initialLoad]);
  
  // Set initialLoad to false after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle filter changes with debounce for search
  const handleFilterChange = (newFilters) => {
    // console.log('Filter change:', newFilters);
    
    if (newFilters.search !== undefined) {
      // Debounce search
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
      
      searchDebounceTimer.current = setTimeout(() => {
        setFilters(prev => ({
          ...prev,
          ...newFilters,
          page: 1 // Reset to first page when filters change
        }));
      }, 500);
    } else {
      setFilters(prev => ({
        ...prev,
        ...newFilters,
        page: 1
      }));
    }
  };
  
  // Handle sort change
  const handleSortChange = (sortBy) => {
    handleFilterChange({ sortBy });
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle search
  const handleSearch = (searchTerm) => {
    handleFilterChange({ search: searchTerm });
  };
  
  // Handle platform toggle
  const handlePlatformToggle = (platform) => {
    const currentPlatforms = [...filters.platforms];
    const index = currentPlatforms.indexOf(platform);
    
    if (index > -1) {
      currentPlatforms.splice(index, 1);
    } else {
      currentPlatforms.push(platform);
    }
    
    handleFilterChange({ platforms: currentPlatforms });
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      platforms: [],
      sortBy: 'newest',
      page: 1,
      limit: 12,
      includeHits: false
    });
    
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    
    // Close mobile menu after clearing
    setShowMobileMenu(false);
  };
  
  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    handleFilterChange({ 
      category: categoryId,
      page: 1
    });
    // Close mobile menu after selecting category
    setShowMobileMenu(false);
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  // Handle logout
  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };
  
  // Render mobile menu (drawer)
  const renderMobileMenu = () => (
    <div className={`mobile-menu ${showMobileMenu ? 'show' : ''}`}>
      <div className="mobile-menu-header">
        <h3>Filters & Menu</h3>
        <button className="close-menu-btn" onClick={() => setShowMobileMenu(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="mobile-menu-content">
        {/* User Info */}
        <div className="mobile-user-info">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-details">
            <div className="user-name">user1@gmail.com</div>
            <div className="user-role">CUSTOMER</div>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="mobile-filter-section">
          <h4>Categories</h4>
          <div className="category-filters">
            <button 
              className={`category-chip ${!filters.category ? 'active' : ''}`}
              onClick={() => handleCategoryFilter('')}
            >
              All Categories
            </button>
            {categories.slice(0, 10).map(category => (
              <button
                key={category.id || category._id}
                className={`category-chip ${filters.category === (category.id || category._id) ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(category.id || category._id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Price Filter */}
        <div className="mobile-filter-section">
          <h4>Price Range</h4>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
              min="0"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
              min="0"
            />
          </div>
        </div>
        
        {/* Platforms Filter */}
        <div className="mobile-filter-section">
          <h4>Available Platforms</h4>
          <div className="platform-filters">
            {platformOptions.map(platform => (
              <label key={platform} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.platforms.includes(platform)}
                  onChange={() => handlePlatformToggle(platform)}
                />
                <span>{platform}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="mobile-menu-actions">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            <i className="fas fa-filter"></i>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render pagination
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - 2);
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        {start > 1 && (
          <>
            <button
              className={`pagination-btn ${1 === pagination.page ? 'active' : ''}`}
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {start > 2 && <span className="pagination-dots">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            className={`pagination-btn ${page === pagination.page ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
        
        {end < pagination.totalPages && (
          <>
            {end < pagination.totalPages - 1 && <span className="pagination-dots">...</span>}
            <button
              className={`pagination-btn ${pagination.totalPages === pagination.page ? 'active' : ''}`}
              onClick={() => handlePageChange(pagination.totalPages)}
            >
              {pagination.totalPages}
            </button>
          </>
        )}
        
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNext}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };
  
  // Main render
  if (loading && initialLoad) {
    return <LoadingSpinner fullscreen={true} />;
  }
  
  return (
    <div className="customer-dashboard">
      {/* Top Navigation Bar - Sticky */}
      <nav className="top-nav">
        <div className="nav-container">
          {/* Desktop: Logo on left */}
          <div className="nav-logo desktop-only">
            <i className="fas fa-store"></i>
            <span>E-Shop</span>
          </div>
          
          {/* Mobile: Hamburger menu */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <i className="fas fa-bars"></i>
          </button>
          
          {/* Search Bar - Centered */}
          <div className="nav-search">
            <div className="search-bar">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                defaultValue={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          
          {/* User Profile - Top Right */}
          <div className="nav-user">
            <div className="user-profile">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="user-info desktop-only">
                <div className="user-name">user1@gmail.com</div>
                <div className="user-role">CUSTOMER</div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Drawer */}
      {renderMobileMenu()}
      
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Page Header */}
        <div className="page-header">
          <h1>Discover Amazing Products</h1>
          <p>Find the best deals across multiple platforms</p>
        </div>
        
        {/* Results Info and Sort */}
        <div className="results-header">
          <div className="results-info">
            <h2>
              {filters.category ? 
                categories.find(c => (c.id || c._id) === filters.category)?.name || 'Category' : 
                'All Products'
              }
            </h2>
            {pagination.total > 0 && (
              <span className="results-count">
                Showing {products.length} of {pagination.total} products
                {filters.search && ` for "${filters.search}"`}
              </span>
            )}
          </div>
          
          <div className="sort-options">
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="popular">Most Popular</option>
            </select>
            
            {/* Mobile Filter Button */}
            <button className="mobile-filter-btn" onClick={toggleMobileMenu}>
              <i className="fas fa-filter"></i>
              <span>Filters</span>
            </button>
          </div>
        </div>
        
        {/* Active Filters */}
        {(filters.search || filters.category || filters.minPrice || filters.maxPrice || 
          filters.platforms.length > 0) && (
          <div className="active-filters">
            <div className="filter-chips">
              {filters.search && (
                <span className="filter-chip">
                  Search: {filters.search}
                  <button onClick={() => handleFilterChange({ search: '' })}>×</button>
                </span>
              )}
              {filters.category && (
                <span className="filter-chip">
                  Category: {categories.find(c => (c.id || c._id) === filters.category)?.name || filters.category}
                  <button onClick={() => handleFilterChange({ category: '' })}>×</button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="filter-chip">
                  Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                  <button onClick={() => handleFilterChange({ minPrice: '', maxPrice: '' })}>×</button>
                </span>
              )}
              {filters.platforms.map(platform => (
                <span key={platform} className="filter-chip">
                  {platform}
                  <button onClick={() => handlePlatformToggle(platform)}>×</button>
                </span>
              ))}
              <button className="clear-all-filters" onClick={handleClearFilters}>
                Clear All
              </button>
            </div>
          </div>
        )}
        
        {/* Products Grid */}
        {loading && !initialLoad ? (
          <div className="loading-products">
            <LoadingSpinner />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => handleFilterChange({})} />
        ) : products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map(product => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  showPlatforms={true}
                  showStock={true}
                  showCategory={false}
                  compact={false}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && renderPagination()}
          </>
        ) : (
          <div className="no-results">
            <i className="fas fa-search fa-3x"></i>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;