package com.school.ecommerce.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.school.ecommerce.model.Review;
import com.school.ecommerce.repository.ReviewRepository;
import com.school.ecommerce.service.ReviewService;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Override
    public Review addReview(Review review) {
        return reviewRepository.save(review);
    }

    @Override
    public List<Review> getReviewsByProductId(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    @Override
    public Object getByProduct(String productId) {

        throw new UnsupportedOperationException("Unimplemented method 'getByProduct'");
    }
}
