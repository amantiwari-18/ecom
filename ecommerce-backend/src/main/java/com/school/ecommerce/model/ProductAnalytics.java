package com.school.ecommerce.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "product_analytics")
public class ProductAnalytics {

    @Id
    private String id;

    private String productId;
    private String productName;

    private long views = 0;
    private long hits = 0;
    private long addsToCart = 0;
    private long purchases = 0;

    private LocalDateTime lastViewed;
    private LocalDateTime createdAt = LocalDateTime.now();
}
