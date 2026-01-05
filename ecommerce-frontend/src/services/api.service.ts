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
  private isSetupComplete = false;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // Increased timeout to 30 seconds
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024, // 50MB
      validateStatus: (status) => status >= 200 && status < 500, // Accept 400-499 as valid responses
    });

    this.pendingRequests = new Map();
    this.requestCache = new Map();

    // Setup interceptors
    this.setupInterceptors();
    this.isSetupComplete = true;
  }

  private generateRequestKey(config: AxiosRequestConfig): string {
    try {
      const url = config.url || '';
      const method = config.method || 'get';
      const params = config.params || {};
      
      // Create a simple hash of the params
      let paramsStr = '';
      if (params && typeof params === 'object') {
        const sortedKeys = Object.keys(params).sort();
        paramsStr = sortedKeys.map(key => `${key}=${String(params[key])}`).join('&');
      }
      
      return `${method}:${url}:${paramsStr}`.substring(0, 500);
    } catch (error) {
      console.error('Error generating request key:', error);
      return `${config.method}:${config.url}`;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      if (!this.isSetupComplete) {
        return config;
      }

      // Add auth token if exists
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add cache busting parameter only for GET requests
      if (config.method?.toLowerCase() === 'get') {
        const now = Date.now();
        const cacheBustTime = Math.floor(now / 60000); // 1 minute intervals
        config.params = {
          ...config.params,
          _t: cacheBustTime
        };
      }

      // Simplified duplicate request prevention
      const requestKey = this.generateRequestKey(config);
      const now = Date.now();
      
      // Check if same request was made within 300ms
      if (this.pendingRequests.has(requestKey)) {
        const pending = this.pendingRequests.get(requestKey)!;
        if (now - pending.timestamp < 300) {
          pending.source.cancel('Duplicate request cancelled');
          // console.log(`Cancelling duplicate request: ${requestKey}`);
        }
      }
      
      // Always create a new cancel token
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      this.pendingRequests.set(requestKey, { source, timestamp: now });

      // Cleanup old pending requests
      this.cleanupPendingRequests();

      // console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);

      return config;
    }, (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (!this.isSetupComplete) {
          return response;
        }

        const requestKey = this.generateRequestKey(response.config);
        this.pendingRequests.delete(requestKey);
        
        // console.log(`API Response: ${response.status} ${response.config.url}`, {
        //   dataCount: Array.isArray(response.data) ? response.data.length : 
        //             (response.data?.data && Array.isArray(response.data.data) ? response.data.data.length : 'N/A'),
        //   status: response.status,
        //   statusText: response.statusText
        // });

        return response;
      },
      (error) => {
        if (!this.isSetupComplete) {
          return Promise.reject(error);
        }

        if (error.config) {
          const requestKey = this.generateRequestKey(error.config);
          this.pendingRequests.delete(requestKey);
        }

        // Handle cancellation
        if (axios.isCancel(error)) {
          // console.log('Request was cancelled:', error.message);
          return Promise.reject(new Error('Request cancelled'));
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network error:', error.message);
          return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        // Handle HTTP errors
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            console.error('Bad Request:', data?.message || error.config.url);
            break;
          case 401:
            console.warn('Unauthorized - Redirecting to login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            break;
          case 403:
            console.error('Forbidden:', data?.message || 'Access denied');
            break;
          case 404:
            console.error('Not Found:', error.config.url);
            break;
          case 429:
            console.error('Too Many Requests - Rate limited');
            break;
          case 431:
            console.error('Request Header Fields Too Large - Try clearing cache');
            break;
          case 500:
            console.error('Server Error:', data?.message || 'Internal server error');
            break;
          case 502:
          case 503:
          case 504:
            console.error('Server Unavailable:', `Status ${status} - ${data?.message || 'Service unavailable'}`);
            break;
          default:
            console.error(`HTTP Error ${status}:`, data?.message || error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  private cleanupPendingRequests(): void {
    const now = Date.now();
    for (const [key, value] of this.pendingRequests.entries()) {
      if (now - value.timestamp > 30000) { // 30 seconds timeout
        value.source.cancel('Request timeout');
        this.pendingRequests.delete(key);
      }
    }
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig, useCache = false): Promise<T> {
    try {
      // Check cache for GET requests
      if (useCache && config.method?.toLowerCase() === 'get') {
        const cacheKey = this.generateRequestKey(config);
        const cached = this.requestCache.get(cacheKey);
        const now = Date.now();
        
        // Cache valid for 60 seconds
        if (cached && now - cached.timestamp < 60000) {
          // console.log(`Cache hit: ${cacheKey}`);
          return cached.data;
        }
      }

      const response = await this.client.request<T>(config);
      
      // Cache successful GET responses
      if (useCache && config.method?.toLowerCase() === 'get' && response.status >= 200 && response.status < 300) {
        const cacheKey = this.generateRequestKey(config);
        this.requestCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      // Don't retry for client errors (4xx) or cancellations
      if (axios.isCancel(error) || (error.response && error.response.status >= 400 && error.response.status < 500)) {
        throw error;
      }
      
      // Retry only once for network/server errors
      console.warn('Request failed, retrying once...', error.message);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const response = await this.client.request<T>(config);
        return response.data;
      } catch (retryError) {
        console.error('Retry also failed:', retryError.message);
        throw retryError;
      }
    }
  }

  // Clear all cache
  clearCache(): void {
    this.requestCache.clear();
    // console.log('API cache cleared');
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
    try {
      const params: Record<string, any> = {
        page: filters?.page || 1,
        limit: filters?.limit || 12,
        sortBy: filters?.sortBy || 'newest',
        includeHits: filters?.includeHits || false
      };

      // Add optional filters
      if (filters?.search) params.search = filters.search;
      if (filters?.category) params.category = filters.category;
      if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
      if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
      if (filters?.inStock !== undefined) params.inStock = filters.inStock;
      if (filters?.localSale !== undefined) params.localSale = filters.localSale;
      if (filters?.hasExternalLinks !== undefined) params.hasExternalLinks = filters.hasExternalLinks;
      if (filters?.isNew !== undefined) params.isNew = filters.isNew;
      if (filters?.platforms && filters.platforms.length > 0) {
        params.platforms = filters.platforms.join(',');
      }

      // console.log('Making products request with params:', params);

      const response = await this.request<PaginatedResponse<Product>>({
        method: 'GET',
        url: '/v2/products/search',
        params: params
      }, false); // Disable cache for search results
  console.log('ApiService.getProducts called with:', filters);
  console.log('Making request to:', `${API_BASE_URL}/v2/products/search`);
      console.log('Products API response:', {
        dataCount: response.data?.length || 0,
        pagination: response.pagination,
        filters: response.filters
      });

      // Ensure response structure
      return {
        data: response.data || [],
        pagination: response.pagination || {
          page: params.page,
          limit: params.limit,
          total: response.data?.length || 0,
          totalPages: Math.ceil((response.data?.length || 0) / params.limit),
          hasNext: false,
          hasPrev: false
        },
        filters: filters
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty response
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
  async getProductById(id: string, trackHit: boolean = false): Promise<Product> {
    try {
      const params: Record<string, any> = {};
      if (trackHit) {
        params.track = 'true';
      }

      const product = await this.request<Product>({
        method: 'GET',
        url: `/v2/products/${id}`,
        params: params
      }, true); // Cache product details

      return product;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      // Return empty product object
      return {
        id,
        name: 'Product Not Found',
        description: 'This product could not be loaded.',
        price: 0,
        categoryId: '',
        inStock: false,
        rating: 0,
        reviewCount: 0
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
        url: '/v2/products/featured',
        params: { limit }
      }, true); // Cache featured products

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
        url: '/v2/products/trending',
        params: { limit }
      }, true); // Cache trending products

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
        url: '/v2/products/new',
        params: { limit }
      }, true); // Cache new arrivals

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
        url: '/v2/products/sale',
        params: { limit }
      }, true); // Cache sale products

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
        url: `/v2/products/${productId}/similar`,
        params: { limit }
      }, true); // Cache similar products

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
        url: `/v2/products/${productId}/hit`
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
        url: '/categories'
      }, true); // Cache categories for 5 minutes

      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      return await this.request<Category>({
        method: 'GET',
        url: `/categories/${id}`
      }, true);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return { id, name: 'Unknown Category' };
    }
  }

  // ==================== CART HELPER METHODS ====================

  getCart(): CartItem[] {
    try {
      const cart = localStorage.getItem('cart');
      if (!cart) return [];
      
      const parsed = JSON.parse(cart);
      return Array.isArray(parsed) ? parsed : [];
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
      // console.log('Cart updated with', items.length, 'items');
    } catch (error) {
      console.error('Error updating cart in localStorage:', error);
    }
  }

  addToCart(product: Product, quantity: number = 1): CartItem[] {
    const cart = this.getCart();
    
    // Find existing item
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    
    if (existingIndex > -1) {
      // Update existing item
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].subtotal = cart[existingIndex].quantity * cart[existingIndex].discountedPrice;
    } else {
      // Calculate discounted price
      const discountedPrice = product.discount ? 
        product.price * (1 - product.discount / 100) : product.price;
      
      // Create new cart item
      const cartItem: CartItem = {
        id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        product: product,
        name: product.name || 'Unnamed Product',
        price: product.price || 0,
        discountedPrice: discountedPrice,
        quantity: quantity,
        image: product.image || product.images?.[0],
        subtotal: quantity * discountedPrice
      };
      
      cart.push(cartItem);
    }

    this.updateCart(cart);
    return cart;
  }

  removeFromCart(productId: string): CartItem[] {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.productId !== productId);
    this.updateCart(updatedCart);
    return updatedCart;
  }

  updateCartItemQuantity(productId: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.productId === productId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart[itemIndex].quantity = quantity;
        cart[itemIndex].subtotal = quantity * cart[itemIndex].discountedPrice;
      }
    }
    
    this.updateCart(cart);
    return cart;
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.subtotal, 0);
  }

  // ==================== AUTH METHODS ====================

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.clearCache();
    // console.log('User logged out');
  }
// Add these to your ApiService class

// ==================== PRODUCT IMAGE METHODS ====================

/**
 * Create product with image upload (multipart/form-data)
 */
async createProductWithImage(formData: FormData): Promise<Product> {
  try {
    const response = await this.client.post('/v2/products/with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product with image:', error);
    throw error;
  }
}

/**
 * Update product with image upload (multipart/form-data)
 */
async updateProductWithImage(id: string, formData: FormData): Promise<Product> {
  try {
    const response = await this.client.put(`/v2/products/${id}/with-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product with image:', error);
    throw error;
  }
}

/**
 * Update product platforms
 */
async updatePlatforms(productId: string, platforms: string[]): Promise<void> {
  try {
    await this.request({
      method: 'PUT',
      url: `/v2/products/${productId}/platforms`,
      data: { platforms }
    }, false);
  } catch (error) {
    console.error('Error updating platforms:', error);
    throw error;
  }
}

/**
 * Update product external links
 */
async updateExternalLinks(productId: string, links: Array<{platform: string, url: string}>): Promise<void> {
  try {
    await this.request({
      method: 'PUT',
      url: `/v2/products/${productId}/external-links`,
      data: { externalLinks: links }
    }, false);
  } catch (error) {
    console.error('Error updating external links:', error);
    throw error;
  }
}

// ==================== ALTERNATIVE: UNIFIED PRODUCT CRUD ====================

/**
 * Save product (create or update)
 * Handles both regular JSON and FormData for images
 */
async saveProduct(productData: any, isUpdate = false): Promise<Product> {
  try {
    let response;
    
    if (productData instanceof FormData) {
      // Handle multipart/form-data for image upload
      if (isUpdate) {
        const id = productData.get('id') || productData.get('_id');
        if (!id) throw new Error('Product ID is required for update');
        
        response = await this.client.put(`/v2/products/${id}`, productData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await this.client.post('/v2/products', productData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
    } else {
      // Handle regular JSON
      if (isUpdate) {
        if (!productData.id && !productData._id) {
          throw new Error('Product ID is required for update');
        }
        const id = productData.id || productData._id;
        response = await this.request({
          method: 'PUT',
          url: `/v2/products/${id}`,
          data: productData
        }, false);
      } else {
        response = await this.request({
          method: 'POST',
          url: '/v2/products',
          data: productData
        }, false);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

// ==================== CATEGORY CRUD ====================

/**
 * Create a new category
 */
async createCategory(categoryData: Partial<Category>): Promise<Category> {
  try {
    return await this.request<Category>({
      method: 'POST',
      url: '/categories',
      data: categoryData
    }, false);
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

/**
 * Update an existing category
 */
async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
  try {
    return await this.request<Category>({
      method: 'PUT',
      url: `/categories/${id}`,
      data: categoryData
    }, false);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

/**
 * Delete a category
 */
async deleteCategory(id: string): Promise<void> {
  try {
    await this.request({
      method: 'DELETE',
      url: `/categories/${id}`
    }, false);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ==================== INVENTORY METHODS ====================

/**
 * Get inventory data
 */
async getInventory(): Promise<{ data: any[] }> {
  try {
    // Try dedicated inventory endpoint first
    try {
      const response = await this.request<any[]>({
        method: 'GET',
        url: '/inventory'
      }, false);
      return { data: response };
    } catch {
      // Fallback to products for inventory info
      const productsResponse = await this.getProducts({ limit: 100 });
      const inventoryData = productsResponse.data.map(product => ({
        id: product.id,
        productId: product.id,
        productName: product.name,
        quantity: product.stockQuantity || 0,
        inStock: product.inStock || false,
        lastUpdated: product.updatedAt || product.createdAt || new Date().toISOString(),
        price: product.price,
        image: product.image
      }));
      return { data: inventoryData };
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { data: [] };
  }
}

/**
 * Update inventory stock
 */
async updateInventory(productId: string, data: { quantity: number; inStock?: boolean }): Promise<any> {
  try {
    return await this.request({
      method: 'PUT',
      url: `/v2/products/${productId}/inventory`,
      data: {
        stockQuantity: data.quantity,
        inStock: data.inStock !== undefined ? data.inStock : data.quantity > 0
      }
    }, false);
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
}

// ==================== UTILITY METHODS ====================

/**
 * Upload single image
 */
async uploadImage(file: File): Promise<{ url: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await this.client.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload multiple images
 */
async uploadImages(files: File[]): Promise<{ urls: string[] }> {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await this.client.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser(): any {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  // ==================== UTILITY METHODS ====================

  formatPrice(price: number): string {
    if (typeof price !== 'number' || isNaN(price)) {
      return '₹0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  // ==================== SEARCH SUGGESTIONS ====================

  async getSearchSuggestions(query: string, limit: number = 5): Promise<SearchSuggestions> {
    try {
      return await this.request<SearchSuggestions>({
        method: 'GET',
        url: '/v2/search/suggestions',
        params: { q: query, limit }
      }, true); // Cache suggestions
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return { products: [], categories: [], suggestions: [] };
    }
  }

  // ==================== ANALYTICS ====================

  async getProductAnalytics(productId: string): Promise<ProductAnalytics> {
    try {
      return await this.request<ProductAnalytics>({
        method: 'GET',
        url: `/v2/products/${productId}/analytics`
      }, false); // Don't cache analytics
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      return {
        productId,
        productName: '',
        hits: 0,
        views: 0,
        addsToCart: 0,
        purchases: 0
      };
    }
  }
  
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

