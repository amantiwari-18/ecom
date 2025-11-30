package com.school.ecommerce.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import com.school.ecommerce.model.Shipping;
import com.school.ecommerce.model.Shipping.Status;
import com.school.ecommerce.service.ShippingService;

@Service
public class ShippingServiceImpl implements ShippingService {

    @Override
    public Shipping calculateShipping(String orderId) {
        Shipping shipping = new Shipping();
        shipping.setOrderId(orderId);
        shipping.setCost(50.0); // default
        return shipping;
    }

    @Override
    public Shipping create(Shipping shipping) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'create'");
    }

    @Override
    public Shipping getByOrder(String orderId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getByOrder'");
    }

    @Override
    public List<Shipping> getAll() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAll'");
    }

    @Override
    public Shipping updateStatus(String id, Status status) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateStatus'");
    }
}
