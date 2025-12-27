package com.school.ecommerce.repository;

import com.school.ecommerce.model.ProductAnalytics;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProductAnalyticsRepository
        extends MongoRepository<ProductAnalytics, String> {

    Optional<ProductAnalytics> findByProductId(String productId);

    void deleteByProductId(String productId);
}
