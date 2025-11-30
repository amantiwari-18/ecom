package com.school.ecommerce.service;

import com.school.ecommerce.dto.OrderDTO;

import java.util.List;

public interface OrderService {
    OrderDTO create(OrderDTO dto);
    OrderDTO getById(String id);
    List<OrderDTO> getAll();
    List<OrderDTO> getByUser(String userId);
    OrderDTO updateStatus(String id, String status, String updateNote);
    void delete(String id);
}

