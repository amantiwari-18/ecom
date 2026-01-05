package com.school.ecommerce.service;

import com.school.ecommerce.dto.*;
import com.school.ecommerce.model.*;
import com.school.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductServiceV2 {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductAnalyticsRepository analyticsRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // ==================== SEARCH & FILTER METHODS ====================

    public PaginatedResponseDTO<ProductDTO> searchProducts(ProductFilterDTO filter) {
        // Build query
        Query query = new Query();

        // Search by name/description
        if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(filter.getSearch(), "i"),
                    Criteria.where("description").regex(filter.getSearch(), "i"));
            query.addCriteria(searchCriteria);
        }

        // Filter by category
        if (filter.getCategory() != null && !filter.getCategory().isEmpty()) {
            query.addCriteria(Criteria.where("categoryId").is(filter.getCategory()));
        }

        // Filter by price range
        Criteria priceCriteria = new Criteria();
        List<Criteria> priceConditions = new ArrayList<>();

        if (filter.getMinPrice() != null) {
            priceConditions.add(Criteria.where("price").gte(filter.getMinPrice()));
        }
        if (filter.getMaxPrice() != null) {
            priceConditions.add(Criteria.where("price").lte(filter.getMaxPrice()));
        }
        if (!priceConditions.isEmpty()) {
            if (priceConditions.size() == 1) {
                query.addCriteria(priceConditions.get(0));
            } else {
                query.addCriteria(new Criteria().andOperator(priceConditions.toArray(new Criteria[0])));
            }
        }

        // Filter by stock status
        // if (filter.getInStock() != null) {
        // query.addCriteria(Criteria.where("inStock").is(filter.getInStock()));
        // }

        // Filter by platforms
        if (filter.getPlatforms() != null && !filter.getPlatforms().isEmpty()) {
            query.addCriteria(Criteria.where("availablePlatforms").in(filter.getPlatforms()));
        }

        // Filter by external links
        if (filter.getHasExternalLinks() != null) {
            if (filter.getHasExternalLinks()) {
                query.addCriteria(Criteria.where("externalLinks").exists(true).ne(null).ne(Collections.emptyList()));
            } else {
                query.addCriteria(Criteria.where("externalLinks").exists(false).orOperator(
                        Criteria.where("externalLinks").is(null),
                        Criteria.where("externalLinks").size(0)));
            }
        }

        // Filter by new products (created within last 30 days)
        if (filter.getIsNew() != null && filter.getIsNew()) {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            query.addCriteria(Criteria.where("createdAt").gte(thirtyDaysAgo));
        }

        // Count total results
        long total = mongoTemplate.count(query, Product.class);

        // Apply sorting
        applySorting(query, filter.getSortBy());

        // Apply pagination
        Pageable pageable = PageRequest.of(filter.getPage() - 1, filter.getLimit());
        query.with(pageable);

        // Execute query
        List<Product> products = mongoTemplate.find(query, Product.class);

        // Convert to DTOs
        List<ProductDTO> productDTOs = products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Calculate pagination info
        int totalPages = (int) Math.ceil((double) total / filter.getLimit());
        boolean hasNext = filter.getPage() < totalPages;
        boolean hasPrev = filter.getPage() > 1;

        PaginationInfoDTO paginationInfo = new PaginationInfoDTO();
        paginationInfo.setPage(filter.getPage());
        paginationInfo.setLimit(filter.getLimit());
        paginationInfo.setTotal(total);
        paginationInfo.setTotalPages(totalPages);
        paginationInfo.setHasNext(hasNext);
        paginationInfo.setHasPrev(hasPrev);

        PaginatedResponseDTO<ProductDTO> response = new PaginatedResponseDTO<>();
        response.setData(productDTOs);
        response.setPagination(paginationInfo);
        response.setFilters(filter);

        return response;
    }

    private void applySorting(Query query, String sortBy) {
        switch (sortBy) {
            case "price_asc":
                query.with(Sort.by(Sort.Direction.ASC, "price"));
                break;
            case "price_desc":
                query.with(Sort.by(Sort.Direction.DESC, "price"));
                break;
            case "rating":
                query.with(Sort.by(Sort.Direction.DESC, "rating"));
                break;
            case "popular":
                query.with(Sort.by(Sort.Direction.DESC, "hits"));
                break;
            case "name_asc":
                query.with(Sort.by(Sort.Direction.ASC, "name"));
                break;
            case "name_desc":
                query.with(Sort.by(Sort.Direction.DESC, "name"));
                break;
            case "newest":
            default:
                query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
                break;
        }
    }

    // ==================== SPECIAL COLLECTIONS ====================

    public List<ProductDTO> getFeaturedProducts(int limit) {
        // Featured products: high rating, good reviews, and popular
        Query query = new Query();
        query.addCriteria(Criteria.where("rating").gte(4.0));
        query.with(Sort.by(Sort.Direction.DESC, "rating", "reviewCount", "hits"));
        query.limit(limit);

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getTrendingProducts(int limit) {
        // Trending: products with most hits in last 7 days
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);

        // First get top products by hits
        Query query = new Query();
        query.addCriteria(Criteria.where("lastViewed").gte(weekAgo));
        query.with(Sort.by(Sort.Direction.DESC, "hits"));
        query.limit(limit);

        List<Product> products = mongoTemplate.find(query, Product.class);

        // If not enough recent products, get overall popular products
        if (products.size() < limit) {
            Query backupQuery = new Query();
            backupQuery.with(Sort.by(Sort.Direction.DESC, "hits"));
            backupQuery.limit(limit - products.size());

            List<Product> backupProducts = mongoTemplate.find(backupQuery, Product.class);
            products.addAll(backupProducts);
        }

        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getNewArrivals(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        Query query = new Query();
        query.addCriteria(Criteria.where("createdAt").gte(thirtyDaysAgo));
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.limit(limit);

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsOnSale(int limit) {
        // Products with discount or local sale
        Query query = new Query();
        query.addCriteria(new Criteria().orOperator(
                Criteria.where("discount").gt(0)));
        query.with(Sort.by(Sort.Direction.DESC, "discount"));
        query.limit(limit);

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== PRODUCT DETAILS ====================

    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Increment view count asynchronously
        incrementProductHitsAsync(id);

        return convertToDTO(product);
    }

    public void incrementProductHits(String id) {
        // Update product hits
        Query query = new Query(Criteria.where("id").is(id));
        Update update = new Update().inc("hits", 1).set("lastViewed", LocalDateTime.now());
        mongoTemplate.updateFirst(query, update, Product.class);

        // Update analytics
        incrementAnalyticsField(id, "views");
    }

    private void incrementProductHitsAsync(String id) {
        // This could be done asynchronously for better performance
        new Thread(() -> {
            incrementProductHits(id);
        }).start();
    }

    public List<ProductDTO> getSimilarProducts(String productId, int limit) {
        Product currentProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Find products in same category with similar price range
        Query query = new Query();
        query.addCriteria(Criteria.where("categoryId").is(currentProduct.getCategoryId()));
        query.addCriteria(Criteria.where("id").ne(productId));

        // Price range: ±30% of current price
        double priceRange = currentProduct.getPrice() * 0.3;
        query.addCriteria(Criteria.where("price")
                .gte(currentProduct.getPrice() - priceRange)
                .lte(currentProduct.getPrice() + priceRange));

        query.with(Sort.by(Sort.Direction.DESC, "rating", "hits"));
        query.limit(limit);

        List<Product> products = mongoTemplate.find(query, Product.class);
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductAnalyticsDTO getProductAnalytics(String productId) {
        // Get or create analytics record
        ProductAnalytics analytics = analyticsRepository.findByProductId(productId)
                .orElseGet(() -> {
                    ProductAnalytics newAnalytics = new ProductAnalytics();
                    newAnalytics.setProductId(productId);
                    newAnalytics.setProductName(productRepository.findById(productId)
                            .map(Product::getName)
                            .orElse("Unknown Product"));
                    return analyticsRepository.save(newAnalytics);
                });

        return convertToAnalyticsDTO(analytics);
    }

    private ProductAnalyticsDTO convertToAnalyticsDTO(ProductAnalytics analytics) {

        ProductAnalyticsDTO dto = new ProductAnalyticsDTO();
        dto.setProductId(analytics.getProductId());
        dto.setProductName(analytics.getProductName());
        dto.setViews(analytics.getViews());
        dto.setHits(analytics.getHits());
        dto.setAddsToCart(analytics.getAddsToCart());
        dto.setPurchases(analytics.getPurchases());
        dto.setLastViewed(analytics.getLastViewed());
        dto.setCreatedAt(analytics.getCreatedAt());

        return dto;
    }

    // ==================== SEARCH SUGGESTIONS ====================

    public SearchSuggestionsDTO getSearchSuggestions(String query, int limit) {
        SearchSuggestionsDTO suggestions = new SearchSuggestionsDTO();

        // Product suggestions
        Query productQuery = new Query(
                Criteria.where("name").regex(query, "i"));
        productQuery.limit(limit);
        productQuery.fields().include("id", "name", "image");

        List<Product> products = mongoTemplate.find(productQuery, Product.class);
        suggestions.setProducts(products.stream()
                .map(p -> new ProductSuggestionDTO(p.getId(), p.getName(), p.getImage()))
                .collect(Collectors.toList()));

        // Category suggestions
        Query categoryQuery = new Query(
                Criteria.where("name").regex(query, "i"));
        categoryQuery.limit(limit);
        categoryQuery.fields().include("id", "name");

        List<Category> categories = mongoTemplate.find(categoryQuery, Category.class);
        suggestions.setCategories(categories.stream()
                .map(c -> new CategorySuggestionDTO(c.getId(), c.getName()))
                .collect(Collectors.toList()));

        // Popular search terms (you might want to store these separately)
        suggestions.setSuggestions(Arrays.asList(
                query + " best price",
                query + " online",
                "buy " + query,
                query + " deals"));

        return suggestions;
    }

    // ==================== BATCH OPERATIONS ====================

    public List<ProductDTO> getProductsByIds(List<String> ids) {
        List<Product> products = productRepository.findAllById(ids);
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== CRUD OPERATIONS ====================

    public ProductDTO create(ProductDTO dto) {
        Product product = convertToEntity(dto);
        // product.setCreatedAt(LocalDateTime.now());
        // product.setUpdatedAt(LocalDateTime.now());
        // product.setHits(0);

        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    public ProductDTO createWithImage(ProductDTO dto) {
        // Handle image upload and then create
        ProductDTO created = create(dto);

        // Here you would typically handle the MultipartFile upload
        // and update the product with image URLs

        return created;
    }

    public void delete(String id) {
        productRepository.deleteById(id);
        analyticsRepository.deleteByProductId(id);
    }

    public ProductDTO update(String id, ProductDTO dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Update fields
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setCategoryId(dto.getCategoryId());
        existing.setImages(dto.getImages());
        existing.setAvailablePlatforms(dto.getAvailablePlatforms());
        existing.setExternalLinks(dto.getExternalLinks());
        // existing.setUpdatedAt(LocalDateTime.now());

        Product updated = productRepository.save(existing);
        return convertToDTO(updated);
    }

    // public void delete(String id) {
    // productRepository.deleteById(id);
    // // Also delete analytics
    // analyticsRepository.deleteByProductId(id);
    // }

    // ==================== EXTERNAL LINKS & PLATFORMS ====================

    public ProductDTO updateExternalLinks(String id, List<ExternalLink> externalLinks) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setExternalLinks(externalLinks);
        // product.setUpdatedAt(LocalDateTime.now());

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    public ProductDTO updatePlatforms(String id, List<String> platforms) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setAvailablePlatforms(platforms);
        // product.setUpdatedAt(LocalDateTime.now());

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    public ProductDTO updateImages(String id, List<MultipartFile> images) {
        // Handle image uploads
        // This would typically upload to cloud storage and get URLs

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // For now, just update the product
        // product.setUpdatedAt(LocalDateTime.now());

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    // ==================== ANALYTICS HELPERS ====================

    private void incrementAnalyticsField(String productId, String field) {
        Query query = new Query(Criteria.where("productId").is(productId));
        Update update = new Update().inc(field, 1);

        mongoTemplate.upsert(query, update, ProductAnalytics.class);
    }

    // ==================== CONVERSION METHODS ====================

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategoryId(product.getCategoryId());
        dto.setImages(product.getImages());
        dto.setAvailablePlatforms(product.getAvailablePlatforms());
        dto.setExternalLinks(product.getExternalLinks());
        // dto.setHits(product.getHits());
        // dto.setCreatedAt(product.getCreatedAt());
        // dto.setUpdatedAt(product.getUpdatedAt());

        // Add category name if available
        // if (product.getCategoryId() != null) {
        // categoryRepository.findById(product.getCategoryId())
        // .ifPresent(category -> dto.setCategoryName(category.getName()));
        // }

        return dto;
    }

    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategoryId(dto.getCategoryId());
        product.setImages(dto.getImages());
        product.setAvailablePlatforms(dto.getAvailablePlatforms());
        product.setExternalLinks(dto.getExternalLinks());
        // product.setHits(dto.getHits());

        return product;
    }

    // private ProductAnalyticsDTO convertToAnalyticsDTO(ProductAnalytics analytics)
    // {
    // ProductAnalyticsDTO dto = new ProductAnalyticsDTO();
    // dto.setProductId(analytics.getProductId());
    // dto.setProductName(analytics.getProductName());
    // dto.setHits(analytics.getHits());
    // dto.setViews(analytics.getViews());
    // dto.setAddsToCart(analytics.getAddsToCart());
    // dto.setPurchases(analytics.getPurchases());
    // dto.setLastViewed(analytics.getLastViewed());
    // dto.setCreatedAt(analytics.getCreatedAt());
    // dto.setUpdatedAt(analytics.getUpdatedAt());

    // return dto;
    // }

}