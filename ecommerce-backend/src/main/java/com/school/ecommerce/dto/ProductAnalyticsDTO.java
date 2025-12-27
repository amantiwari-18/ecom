package com.school.ecommerce.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductAnalyticsDTO {

    private String productId;
    private String productName;
    private long views;
    private long hits;
    private long addsToCart;
    private long purchases;
    private LocalDateTime lastViewed;
    private LocalDateTime createdAt;
}
