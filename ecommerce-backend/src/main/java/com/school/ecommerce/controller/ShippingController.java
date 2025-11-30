package com.school.ecommerce.controller;

import com.school.ecommerce.model.Shipping;
import com.school.ecommerce.service.ShippingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {
    private final ShippingService shippingService;
    public ShippingController(ShippingService shippingService) { this.shippingService = shippingService; }

    @PostMapping
    public ResponseEntity<Shipping> create(@RequestBody Shipping shipping) {
        return ResponseEntity.ok(shippingService.create(shipping));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Shipping> getByOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(shippingService.getByOrder(orderId));
    }

    @GetMapping
    public ResponseEntity<List<Shipping>> getAll() {
        return ResponseEntity.ok(shippingService.getAll());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Shipping> updateStatus(@PathVariable String id, @RequestParam Shipping.Status status) {
        return ResponseEntity.ok(shippingService.updateStatus(id, status));
    }
}

