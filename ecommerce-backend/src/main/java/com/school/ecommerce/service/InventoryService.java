package com.school.ecommerce.service;

import java.util.List;
import com.school.ecommerce.model.Inventory;

public interface InventoryService {

    Inventory updateStock(String productId, int quantity);

    Inventory getByProduct(String productId);

    List<Inventory> getAll();
}
