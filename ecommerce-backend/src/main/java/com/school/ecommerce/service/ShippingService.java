package com.school.ecommerce.service;

import com.school.ecommerce.model.Shipping;
import java.util.List;

public interface ShippingService {
    Shipping create(Shipping shipping);

    Shipping getByOrder(String orderId);

    List<Shipping> getAll();

    Shipping updateStatus(String id, Shipping.Status status);

    Shipping calculateShipping(String orderId);
}
