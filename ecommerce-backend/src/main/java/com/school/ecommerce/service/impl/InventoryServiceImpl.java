package com.school.ecommerce.service.impl;

import com.school.ecommerce.model.Inventory;
import com.school.ecommerce.repository.InventoryRepository;
import com.school.ecommerce.service.InventoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public Inventory updateStock(String productId, int quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId);

        if (inventory == null) {
            inventory = new Inventory();
            inventory.setProductId(productId);
        }

        inventory.setQuantity(quantity);
        return inventoryRepository.save(inventory);
    }

    @Override
    public Inventory getByProduct(String productId) {
        return inventoryRepository.findByProductId(productId);
    }

    @Override
    public List<Inventory> getAll() {
        return inventoryRepository.findAll();
    }
}
