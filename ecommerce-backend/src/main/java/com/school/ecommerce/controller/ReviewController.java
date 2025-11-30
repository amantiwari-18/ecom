package com.school.ecommerce.controller;

import com.school.ecommerce.model.Review;
import com.school.ecommerce.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.addReview(review));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Object> getByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getByProduct(productId));
    }
}
