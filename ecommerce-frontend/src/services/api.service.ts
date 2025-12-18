import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

const getRequestKey = (config) => {
  return `${config.method}:${config.url}`;
};

// Request interceptor to prevent duplicate requests
apiClient.interceptors.request.use((config) => {
  const requestKey = getRequestKey(config);

  if (pendingRequests.has(requestKey)) {
    // Cancel duplicate request
    config.cancelToken = pendingRequests.get(requestKey).token;
  } else {
    // Create new cancel token for this request
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    pendingRequests.set(requestKey, { source, timestamp: Date.now() });
  }

  return config;
});

// Response interceptor to clean up pending requests
apiClient.interceptors.response.use(
  (response) => {
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    if (!axios.isCancel(error)) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }
    return Promise.reject(error);
  }
);

// Clean up old pending requests after 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pendingRequests.entries()) {
    if (now - value.timestamp > 30000) {
      value.source.cancel('Request timeout');
      pendingRequests.delete(key);
    }
  }
}, 10000);

// Products
export const getProducts = () => apiClient.get('/products');
export const getProductById = (id) => apiClient.get(`/products/${id}`);

export const createProduct = (data) => {
  return apiClient.post('/products', data);
};

export const createProductWithImage = (formData) => {
  return apiClient.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateProduct = (id, formData) => {
  return apiClient.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);
export const getProductsByCategory = (categoryId) => apiClient.get(`/products/category/${categoryId}`);

// Categories
export const getCategories = () => apiClient.get('/categories');
export const getCategoryById = (id) => apiClient.get(`/categories/${id}`);
export const createCategory = (data) => apiClient.post('/categories', data);
export const updateCategory = (id, data) => apiClient.put(`/categories/${id}`, data);
export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`);

// Inventory
export const getInventory = () => apiClient.get('/inventory');
export const getInventoryByProductId = (productId) => apiClient.get(`/inventory/${productId}`);
export const updateInventory = (productId, data) => apiClient.put(`/inventory/${productId}`, data);
