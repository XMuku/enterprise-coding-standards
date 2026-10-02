package com.example.order.web;

import com.example.order.model.Order;

public record OrderResponse(String orderId, String productName, int quantity) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.orderId(), order.productName(), order.quantity());
    }
}
