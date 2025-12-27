import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Type Definitions
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  categoryId: string;
  category?: Category;
  image?: string;
  images?: string[];
  externalLinks?: ExternalLink[];
  externalLink?: string;
  availablePlatforms?: string[];
  inStock: boolean;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  specifications?: Record<string, any>;
  isNew?: boolean;
  sku?: string;
  localSale?: boolean;
  hits?: number;
  createdAt?: string;
  updatedAt?: string;
  categoryName?: string;
}

export interface ExternalLink {
  id?: string;
  platform: string;
  url: string;
  price?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  localSale?: boolean;
  platforms?: string[];
  hasExternalLinks?: boolean;
  isNew?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
  includeHits?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: ProductFilters;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  hits: number;
  views: number;
  addsToCart: number;
  purchases: number;
  lastViewed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchSuggestions {
  products: Array<{ id: string; name: string; image?: string }>;
  categories: Array<{ id: string; name: string }>;
  suggestions: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  name: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  image?: string;
  subtotal: number;
}

// API Service Class
class ApiService {
  private client: AxiosInstance;
  private pendingRequests: Map<string, { source: CancelTokenSource; timestamp: number }>;
  private requestCache: Map<string, { data: any; timestamp: number }>;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 15000,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024, // 50MB
    });

    this.pendingRequests = new Map();
    this.requestCache = new Map();

    // Setup interceptors
    this.setupInterceptors();
    this.cleanupPendingRequests();
  }

  private generateRequestKey(config: AxiosRequestConfig): string {
    // Create a simplified key to avoid header field too large errors
    const url = config.url || '';
    const method = config.method || 'get';
    const params = config.params ? this.simplifyParams(config.params) : '';
    return `${method}:${url}:${params}`.substring(0, 200); // Limit key length
  }

  private simplifyParams(params: any): string {
    try {
      // Only include essential params to keep key small
      if (typeof params === 'object') {
        const simpleParams: Record<string, string> = {};
        Object.keys(params).forEach(key => {
          if (['search', 'category', 'page', 'limit', 'sortBy'].includes(key)) {
            simpleParams[key] = String(params[key]);
          }
        });
        return JSON.stringify(simpleParams);
      }
      return String(params);
    } catch {
      return '';
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      // Add auth token if exists
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add timestamp for cache busting (but less frequently)
      if (config.method === 'get') {
        const now = Date.now();
        const cacheBustInterval = 30000; // 30 seconds
        const cacheBustTime = Math.floor(now / cacheBustInterval);
        config.params = {
          ...config.params,
          _t: cacheBustTime
        };
      }

      // Prevent duplicate requests within 1 second
      const requestKey = this.generateRequestKey(config);
      const now = Date.now();
      
      if (this.pendingRequests.has(requestKey)) {
        const pending = this.pendingRequests.get(requestKey)!;
        // Cancel if same request within 1000ms (increased from 2000ms)
        if (now - pending.timestamp < 1000) {
          pending.source.cancel('Duplicate request cancelled');
        }
        config.cancelToken = pending.source.token;
      } else {
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        this.pendingRequests.set(requestKey, { source, timestamp: now });
      }

      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        const requestKey = this.generateRequestKey(response.config);
        this.pendingRequests.delete(requestKey);
        return response;
      },
      (error) => {
        if (error.config) {
          const requestKey = this.generateRequestKey(error.config);
          this.pendingRequests.delete(requestKey);
        }

        // Handle specific error cases
        if (axios.isCancel(error)) {
          console.log('Request cancelled:', error.message);
          return Promise.reject(new Error('Request was cancelled'));
        }

        if (error.response) {
          switch (error.response.status) {
            case 400:
              console.error('Bad request:', error.config.url);
              break;
            case 401:
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
              break;
            case 404:
              console.error('Resource not found:', error.config.url);
              break;
            case 431:
              console.error('Request header fields too large. Try clearing browser cache or using smaller requests.');
              break;
            case 500:
              console.error('Server error:', error.response.data);
              break;
            default:
              console.error(`API Error ${error.response.status}:`, error.response.data);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          throw new Error('Network error. Please check your connection.');
        } else {
          console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  private cleanupPendingRequests(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.pendingRequests.entries()) {
        if (now - value.timestamp > 30000) {
          value.source.cancel('Request timeout');
          this.pendingRequests.delete(key);
        }
      }
    }, 10000);
  }

  // Generic request method with cache and simplified retry logic
  private async request<T>(config: AxiosRequestConfig, useCache = true): Promise<T> {
    try {
      // Check cache for GET requests
      if (useCache && config.method?.toLowerCase() === 'get') {
        const cacheKey = this.generateRequestKey(config);
        const cached = this.requestCache.get(cacheKey);
        const now = Date.now();
        
        // Cache valid for 10 seconds
        if (cached && now - cached.timestamp < 10000) {
          return cached.data;
        }
      }

      const response = await this.client.request<T>(config);
      
      // Cache successful GET responses
      if (useCache && config.method?.toLowerCase() === 'get') {
        const cacheKey = this.generateRequestKey(config);
        this.requestCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      
      // Only retry on network errors, not on 4xx or 431 errors
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      console.log('Request failed, retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const response = await this.client.request<T>(config);
        return response.data;
      } catch (retryError) {
        throw retryError;
      }
    }
  }

  // Clear all cache
  clearCache(): void {
    this.requestCache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(key: string): void {
    this.requestCache.delete(key);
  }

  // ==================== PRODUCT ENDPOINTS ====================

  /**
   * Get products with advanced filtering and pagination
   */
  async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters) {
      // Only add filters that have values to avoid unnecessary params
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
      if (filters.localSale !== undefined) params.append('localSale', filters.localSale.toString());
      if (filters.platforms && filters.platforms.length > 0) {
        filters.platforms.forEach(platform => params.append('platforms', platform));
      }
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    try {
      const response = await this.request<PaginatedResponse<Product>>({
        method: 'GET',
        url: `/v2/products/search${params.toString() ? `?${params.toString()}` : ''}`,
      }, true); // Enable cache
      
      // Ensure data is always an array
      const safeData = Array.isArray(response.data) ? response.data : [];
      
      // Ensure pagination object exists
      const safePagination = response.pagination || {
        page: filters?.page || 1,
        limit: filters?.limit || 12,
        total: safeData.length,
        totalPages: Math.ceil(safeData.length / (filters?.limit || 12)),
        hasNext: false,
        hasPrev: false
      };
      
      return {
        data: safeData,
        pagination: safePagination,
        filters: filters
      };
    } catch (error) {
      console.error('Error in getProducts:', error);
      // Return empty response on error
      return {
        data: [],
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        filters
      };
    }
  }

  /**
   * Get product by ID with optional analytics tracking
   */
  async getProductById(id: string, trackHit: boolean = true): Promise<Product> {
    try {
      const params = new URLSearchParams();
      if (trackHit) {
        params.append('track', 'true');
      }

      return await this.request<Product>({
        method: 'GET',
        url: `/v2/products/${id}${params.toString() ? `?${params.toString()}` : ''}`,
      }, true);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      // Return empty product object instead of throwing
      return {
        id,
        name: 'Product Not Found',
        description: '',
        price: 0,
        categoryId: '',
        inStock: false
      } as Product;
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      const products = await this.request<Product[]>({
        method: 'GET',
        url: `/v2/products/featured?limit=${limit}`,
      }, true);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = 8): Promise<Product[]> {
    try {
      const products = await this.request<Product[]>({
        method: 'GET',
        url: `/v2/products/trending?limit=${limit}`,
      }, true);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error fetching trending products:', error);
      return [];
    }
  }

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 8): Promise<Product[]> {
    try {
      const products = await this.request<Product[]>({
        method: 'GET',
        url: `/v2/products/new?limit=${limit}`,
      }, true);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      return [];
    }
  }

  /**
   * Get products on sale
   */
  async getProductsOnSale(limit: number = 8): Promise<Product[]> {
    try {
      const products = await this.request<Product[]>({
        method: 'GET',
        url: `/v2/products/sale?limit=${limit}`,
      }, true);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error fetching sale products:', error);
      return [];
    }
  }

  /**
   * Get similar products
   */
  async getSimilarProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const products = await this.request<Product[]>({
        method: 'GET',
        url: `/v2/products/${productId}/similar?limit=${limit}`,
      }, true);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  /**
   * Track product hit/view
   */
  async trackProductView(productId: string): Promise<void> {
    try {
      await this.request({
        method: 'POST',
        url: `/v2/products/${productId}/hit`,
      }, false); // Don't cache POST requests
    } catch (error) {
      console.error('Error tracking product view:', error);
      // Fail silently for analytics
    }
  }

  // ==================== CATEGORY ENDPOINTS ====================

  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.request<Category[]>({
        method: 'GET',
        url: '/categories',
      }, true);
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // ==================== CART HELPER METHODS ====================

  getCart(): CartItem[] {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return [];
    }
  }

  updateCart(items: CartItem[]): void {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      // Dispatch custom event for cart updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }));
    } catch (error) {
      console.error('Error updating cart in localStorage:', error);
    }
  }

  addToCart(product: Product, quantity: number = 1): CartItem[] {
    const cart = this.getCart();
    
    // Create a safe product object
    const safeProduct = {
      id: product.id || 'unknown',
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      price: product.price || 0,
      discount: product.discount || 0,
      image: product.image,
      images: product.images,
      inStock: product.inStock || true
    };
    
    const existingItemIndex = cart.findIndex(item => item.productId === safeProduct.id);

    if (existingItemIndex > -1) {
      // Update existing item
      cart[existingItemIndex].quantity += quantity;
      cart[existingItemIndex].subtotal = cart[existingItemIndex].quantity * 
        (cart[existingItemIndex].discountedPrice || cart[existingItemIndex].price);
    } else {
      // Add new item
      const discountedPrice = safeProduct.discount ? 
        safeProduct.price * (1 - safeProduct.discount / 100) : safeProduct.price;
      
      const cartItem: CartItem = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: safeProduct.id,
        product: safeProduct,
        name: safeProduct.name,
        price: safeProduct.price,
        discountedPrice: discountedPrice,
        quantity: quantity,
        image: safeProduct.image || safeProduct.images?.[0],
        subtotal: quantity * discountedPrice
      };
      
      cart.push(cartItem);
    }

    this.updateCart(cart);
    return cart;
  }

  // ==================== UTILITY METHODS ====================

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;