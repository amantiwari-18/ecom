// services/api-compat.js
import { apiService } from './api.service';

// This handles the differences between your API response structure and what the components expect
export const apiCompat = {
  // Products
  getProducts: async (filters = {}) => {
    try {
      // Your API returns array directly, not an object
      const products = await apiService.getProducts(filters);
      
      // Handle null/undefined values in products
      const safeProducts = (Array.isArray(products) ? products : []).map(product => ({
        id: product.id || '',
        name: product.name || 'Unnamed Product',
        description: product.description || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        discount: product.discount || 0,
        categoryId: product.categoryId || '',
        category: product.category || { id: '', name: 'Uncategorized' },
        image: product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
        images: product.images || [],
        externalLink: product.externalLinks?.[0]?.url || product.externalLink || '',
        externalLinks: product.externalLinks || [],
        availablePlatforms: product.availablePlatforms || [],
        inStock: true, // Default to true if your API doesn't have stock info
        stockQuantity: 10, // Default value
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        specifications: product.specifications || {},
        isNew: product.isNew || false,
        sku: product.sku || '',
        localSale: product.localSale || false,
        createdAt: product.createdAt || new Date().toISOString()
      }));

      return {
        products: safeProducts,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 12,
          total: safeProducts.length,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Error in getProducts compat:', error);
      return { products: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
    }
  },

  // Single product
  getProductById: async (id) => {
    try {
      const product = await apiService.getProductById(id);
      
      return {
        id: product.id || '',
        name: product.name || 'Unnamed Product',
        description: product.description || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        discount: product.discount || 0,
        categoryId: product.categoryId || '',
        category: product.category || { id: '', name: 'Uncategorized' },
        image: product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
        images: product.images || [],
        externalLink: product.externalLinks?.[0]?.url || product.externalLink || '',
        externalLinks: product.externalLinks || [],
        availablePlatforms: product.availablePlatforms || [],
        inStock: true,
        stockQuantity: 10,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        specifications: product.specifications || {},
        isNew: product.isNew || false,
        sku: product.sku || '',
        localSale: product.localSale || false,
        createdAt: product.createdAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getProductById compat:', error);
      return null;
    }
  },

  // Categories
  getCategories: async () => {
    try {
      const categories = await apiService.getCategories();
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error in getCategories compat:', error);
      return [];
    }
  },

  // Inventory check - mock for now
  checkStock: async (productId, quantity = 1) => {
    try {
      // If you have inventory API, use it here
      // For now, return mock data
      return {
        available: true,
        stockQuantity: 10
      };
    } catch (error) {
      console.error('Error in checkStock compat:', error);
      return { available: false, stockQuantity: 0 };
    }
  }
};

export default apiCompat;