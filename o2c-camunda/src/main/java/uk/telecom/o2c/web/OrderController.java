package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.service.OrderService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getAll() {
        return orderService.getAllOrders();
    }

    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Map<String, Object> body) {
        String customerId  = (String) body.get("customerId");
        String productId   = (String) body.get("productId");
        String productName = (String) body.get("productName");
        String channel     = (String) body.getOrDefault("channel", "WEB");
        BigDecimal net     = new BigDecimal(body.getOrDefault("recurringNet", "25").toString());

        Order order = orderService.createOrder(customerId, productId, productName, channel, net);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{orderId}/approve-credit")
    public ResponseEntity<Order> approveCredit(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.approveCreditCheck(orderId));
    }

    @PutMapping("/{orderId}/decline-credit")
    public ResponseEntity<Order> declineCredit(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.declineCreditCheck(orderId));
    }
}
