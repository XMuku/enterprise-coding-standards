package com.example.order.application;

import com.example.order.model.Order;
import com.example.order.persistence.OrderStore;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class OrderService {
    private final OrderStore orderStore;

    public OrderService(OrderStore orderStore) {
        this.orderStore = orderStore;
    }

    public Order createOrder(String productName, int quantity) {
        if (productName == null || productName.isBlank() || productName.length() > 80 || quantity < 1 || quantity > 99) {
            throw new IllegalArgumentException("Invalid order input");
        }
        return orderStore.save(new Order(UUID.randomUUID().toString(), productName.strip(), quantity));
    }

    public Optional<Order> findOrder(String orderId) {
        return orderStore.findById(orderId);
    }
}
