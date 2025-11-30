package com.school.ecommerce.repository;

import com.school.ecommerce.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends MongoRepository<Inventory, String> {
    Inventory findByProductId(String productId);
}

