package com.school.ecommerce.controller;

import com.school.ecommerce.model.Inventory;
import com.school.ecommerce.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService inventoryService;
    public InventoryController(InventoryService inventoryService) { this.inventoryService = inventoryService; }

    @PutMapping("/{productId}")
    public ResponseEntity<Inventory> updateStock(@PathVariable String productId, @RequestParam int quantity) {
        return ResponseEntity.ok(inventoryService.updateStock(productId, quantity));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(inventoryService.getByProduct(productId));
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }
}

