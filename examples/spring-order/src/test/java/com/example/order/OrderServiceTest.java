package com.example.order;

import com.example.order.application.OrderService;
import com.example.order.model.Order;
import com.example.order.persistence.OrderStore;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class OrderServiceTest {
    @Test
    void storesTrimmedProductAndRetrievesTheSameOrder() {
        OrderService service = new OrderService(new OrderStore());
        Order order = service.createOrder("  Notebook  ", 2);
        assertEquals("Notebook", order.productName());
        assertEquals(order, service.findOrder(order.orderId()).orElseThrow());
    }

    @Test
    void rejectsInvalidQuantitiesInsteadOfPersistingThem() {
        OrderService service = new OrderService(new OrderStore());
        assertThrows(IllegalArgumentException.class, () -> service.createOrder("Notebook", 0));
        assertThrows(IllegalArgumentException.class, () -> service.createOrder("Notebook", 100));
        assertEquals(99, service.createOrder("Notebook", 99).quantity());
    }

    @Test
    void missingOrderIsNotAnEmptySuccessfulOrder() {
        assertTrue(new OrderService(new OrderStore()).findOrder("missing").isEmpty());
    }
}
