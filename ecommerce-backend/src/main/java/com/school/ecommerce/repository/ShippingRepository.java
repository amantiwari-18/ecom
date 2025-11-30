package com.school.ecommerce.repository;

import com.school.ecommerce.model.Shipping;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingRepository extends MongoRepository<Shipping, String> {
    Shipping findByOrderId(String orderId);
}

