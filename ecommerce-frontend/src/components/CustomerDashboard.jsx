import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [error, setError] = useState(null);
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
    inStock: false,
    localSale: false,
    platforms: [],
    sortBy: 'newest',
    page: 1
  });
  
  // Featured collections
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  
  // Categories
  const [categories, setCategories] = useState([]);
  
  // Platform options
  const platformOptions = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Snapdeal', 'ShopClues'];
  
  // Debounce timer
  const searchDebounceTimer = useRef(null);
  
  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const parsedFilters = {
      search: params.get('search') || '',
      category: params.get('category') || '',
      minPrice: params.get('minPrice') ? parseFloat(params.get('minPrice')) : '',
      maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')) : '',
      inStock: params.get('inStock') === 'true',
      localSale: params.get('localSale') === 'true',
      platforms: params.getAll('platforms') || [],
      sortBy: params.get('sortBy') || 'newest',
      page: parseInt(params.get('page') || '1')
    };
    
    setFilters(parsedFilters);
  }, [location.search]);
  
  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };
  
  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean filters - remove empty values
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) cleanFilters[key] = value;
        } else if (typeof value === 'string') {
          if (value.trim() !== '') cleanFilters[key] = value;
        } else if (typeof value === 'number') {
          if (!isNaN(value)) cleanFilters[key] = value;
        } else if (typeof value === 'boolean') {
          cleanFilters[key] = value;
        }
      });
      
      const response = await apiService.getProducts({
        ...cleanFilters,
        limit: 12,
        page: cleanFilters.page || 1
      });
      
      setProducts(response.data);
      setPagination(response.pagination);
      
      // Update URL
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
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);
  
  // Load featured collections
  const loadFeaturedCollections = async () => {
    try {
      const [featured, trending, newArrivalsData, sale] = await Promise.all([
        apiService.getFeaturedProducts(8),
        apiService.getTrendingProducts(8),
        apiService.getNewArrivals(8),
        apiService.getProductsOnSale(8)
      ]);
      
      setFeaturedProducts(featured);
      setTrendingProducts(trending);
      setNewArrivals(newArrivalsData);
      setSaleProducts(sale);
    } catch (err) {
      console.error('Error loading featured collections:', err);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadProducts();
    loadFeaturedCollections();
    loadCategories();
  }, [loadProducts]);
  
  // Handle filter changes with debounce for search
  const handleFilterChange = (newFilters) => {
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
      inStock: false,
      localSale: false,
      platforms: [],
      sortBy: 'newest',
      page: 1
    });
    
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };
  
  // Handle category filter
  const handleCategoryFilter = (categoryId) => {
    handleFilterChange({ 
      category: categoryId,
      page: 1
    });
  };
  
  // Render featured collection section
  const renderCollectionSection = (title, products, type, icon) => {
    if (products.length === 0) return null;
    
    return (
      <section className="featured-collection">
        <div className="section-header">
          <div className="section-title">
            <i className={`fas fa-${icon}`}></i>
            <h2>{title}</h2>
          </div>
          <button 
            className="view-all-btn"
            onClick={() => navigate(`/products?${type}=true`)}
          >
            View All
          </button>
        </div>
        <div className="products-grid compact">
          {products.slice(0, 4).map(product => (
            <ProductCard
              key={product.id}
              product={product}
              compact={true}
            />
          ))}
        </div>
      </section>
    );
  };
  
  // Render filter sidebar
  const renderFiltersSidebar = () => (
    <div className="filters-sidebar">
      <div className="filters-header">
        <h3>Filters</h3>
        <button className="clear-filters" onClick={handleClearFilters}>
          Clear All
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="filter-section">
        <h4>Category</h4>
        <div className="category-filters">
          <button 
            className={`category-chip ${!filters.category ? 'active' : ''}`}
            onClick={() => handleCategoryFilter('')}
          >
            All Categories
          </button>
          {categories.slice(0, 10).map(category => (
            <button
              key={category.id}
              className={`category-chip ${filters.category === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryFilter(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Price Filter */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
          />
        </div>
      </div>
      
      {/* Stock Filter */}
      <div className="filter-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
          />
          <span>In Stock Only</span>
        </label>
      </div>
      
      {/* Local Sale Filter */}
      <div className="filter-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.localSale}
            onChange={(e) => handleFilterChange({ localSale: e.target.checked })}
          />
          <span>Local Sale Only</span>
        </label>
      </div>
      
      {/* Platforms Filter */}
      <div className="filter-section">
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
  if (loading && products.length === 0) {
    return <LoadingSpinner fullscreen={true} />;
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={loadProducts} />;
  }
  
  return (
    <div className="customer-dashboard">
      {/* Hero/Featured Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Discover Amazing Products</h1>
          <p>Find the best deals across multiple platforms</p>
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
      </div>
      
      {/* Featured Collections Banner */}
      {!filters.search && !filters.category && products.length > 0 && (
        <div className="collections-banner">
          <div className="collection-item" onClick={() => handleFilterChange({ isNew: true })}>
            <i className="fas fa-star"></i>
            <span>New Arrivals</span>
          </div>
          <div className="collection-item" onClick={() => handleFilterChange({ localSale: true })}>
            <i className="fas fa-tag"></i>
            <span>On Sale</span>
          </div>
          <div className="collection-item" onClick={() => handleFilterChange({ inStock: true })}>
            <i className="fas fa-check-circle"></i>
            <span>In Stock</span>
          </div>
          <div className="collection-item" onClick={() => handleFilterChange({ hasExternalLinks: true })}>
            <i className="fas fa-external-link-alt"></i>
            <span>External Links</span>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar Filters */}
        <aside className="filters-container">
          {renderFiltersSidebar()}
        </aside>
        
        {/* Main Products Area */}
        <main className="products-main">
          {/* Header with sort and results count */}
          <div className="products-header">
            <div className="results-info">
              <h2>
                {filters.category ? 
                  categories.find(c => c.id === filters.category)?.name || 'Category' : 
                  'All Products'
                }
              </h2>
              <span className="results-count">
                Showing {products.length} of {pagination.total} products
                {filters.search && ` for "${filters.search}"`}
              </span>
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
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
              <div className="mobile-filters-btn" onClick={() => {
                document.querySelector('.filters-container').classList.toggle('mobile-show');
              }}>
                <i className="fas fa-filter"></i>
              </div>
            </div>
          </div>
          
          {/* Featured Collections (Show when no filters applied) */}
          {!filters.search && !filters.category && products.length > 0 && (
            <div className="featured-collections">
              {renderCollectionSection('Featured Products', featuredProducts, 'featured', 'star')}
              {renderCollectionSection('Trending Now', trendingProducts, 'trending', 'fire')}
              {renderCollectionSection('New Arrivals', newArrivals, 'new', 'newspaper')}
              {renderCollectionSection('On Sale', saleProducts, 'sale', 'tag')}
            </div>
          )}
          
          {/* Active Filters */}
          {(filters.search || filters.category || filters.minPrice || filters.maxPrice || 
            filters.inStock || filters.localSale || filters.platforms.length > 0) && (
            <div className="active-filters">
              <h4>Active Filters:</h4>
              <div className="filter-chips">
                {filters.search && (
                  <span className="filter-chip">
                    Search: {filters.search}
                    <button onClick={() => handleFilterChange({ search: '' })}>×</button>
                  </span>
                )}
                {filters.category && (
                  <span className="filter-chip">
                    Category: {categories.find(c => c.id === filters.category)?.name || filters.category}
                    <button onClick={() => handleFilterChange({ category: '' })}>×</button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="filter-chip">
                    Price: ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                    <button onClick={() => handleFilterChange({ minPrice: '', maxPrice: '' })}>×</button>
                  </span>
                )}
                {filters.inStock && (
                  <span className="filter-chip">
                    In Stock Only
                    <button onClick={() => handleFilterChange({ inStock: false })}>×</button>
                  </span>
                )}
                {filters.localSale && (
                  <span className="filter-chip">
                    Local Sale
                    <button onClick={() => handleFilterChange({ localSale: false })}>×</button>
                  </span>
                )}
                {filters.platforms.map(platform => (
                  <span key={platform} className="filter-chip">
                    {platform}
                    <button onClick={() => handlePlatformToggle(platform)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Products Grid */}
          {products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showPlatforms={true}
                    showStock={true}
                    showCategory={true}
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
          
          {/* Loading overlay for subsequent loads */}
          {loading && <div className="loading-overlay"><LoadingSpinner /></div>}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;