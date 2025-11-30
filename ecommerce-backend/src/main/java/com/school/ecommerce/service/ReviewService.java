package com.school.ecommerce.service;

import java.util.List;
import com.school.ecommerce.model.Review;

public interface ReviewService {
    Review addReview(Review review);

    List<Review> getReviewsByProductId(String productId);

    Object getByProduct(String productId);
}
