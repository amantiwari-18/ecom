package com.school.ecommerce.service.impl;

import com.school.ecommerce.dto.OrderDTO;
import com.school.ecommerce.dto.OrderDTO.UpdateDTO;
import com.school.ecommerce.exception.ResourceNotFoundException;
import com.school.ecommerce.model.Order;
import com.school.ecommerce.repository.OrderRepository;
import com.school.ecommerce.service.OrderService;
import com.school.ecommerce.utils.DateUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    public OrderServiceImpl(OrderRepository orderRepository) { this.orderRepository = orderRepository; }

    private OrderDTO toDTO(Order o) {
        OrderDTO dto = new OrderDTO();
        dto.setId(o.getId());
        dto.setUserId(o.getUserId());
        dto.setProductId(o.getProductId());
        dto.setStatus(o.getStatus().name());
        List<UpdateDTO> updates = o.getHistoryUpdates().stream().map(h -> {
            UpdateDTO u = new UpdateDTO();
            u.setUpdate(h.getUpdate());
            u.setTimestamp(h.getTimestamp());
            return u;
        }).collect(Collectors.toList());
        dto.setHistoryUpdates(updates);
        return dto;
    }

    private Order fromDTO(OrderDTO dto) {
        Order o = new Order();
        o.setId(dto.getId());
        o.setUserId(dto.getUserId());
        o.setProductId(dto.getProductId());
        o.setStatus(Order.Status.valueOf(dto.getStatus()));
        return o;
    }

    @Override
    public OrderDTO create(OrderDTO dto) {
        Order saved = orderRepository.save(fromDTO(dto));
        return toDTO(saved);
    }

    @Override
    public OrderDTO getById(String id) {
        Order o = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toDTO(o);
    }

    @Override
    public List<OrderDTO> getAll() {
        return orderRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getByUser(String userId) {
        return orderRepository.findByUserId(userId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public OrderDTO updateStatus(String id, String status, String updateNote) {
        Order o = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        o.setStatus(Order.Status.valueOf(status.toUpperCase()));
        o.getHistoryUpdates().add(new Order.UpdateHistory(updateNote, DateUtils.now()));
        Order saved = orderRepository.save(o);
        return toDTO(saved);
    }

    @Override
    public void delete(String id) {
        Order o = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        orderRepository.delete(o);
    }
}

