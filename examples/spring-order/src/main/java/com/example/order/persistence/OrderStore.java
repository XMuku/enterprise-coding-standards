package com.example.order.persistence;

import com.example.order.model.Order;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Repository;

@Repository
public class OrderStore {
    private final ConcurrentMap<String, Order> orders = new ConcurrentHashMap<>();

    public Order save(Order order) {
        orders.put(order.orderId(), order);
        return order;
    }

    public Optional<Order> findById(String orderId) {
        return Optional.ofNullable(orders.get(orderId));
    }
}
