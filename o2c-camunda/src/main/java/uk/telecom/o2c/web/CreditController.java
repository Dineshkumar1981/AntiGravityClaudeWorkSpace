package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.Customer;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.CustomerRepository;
import uk.telecom.o2c.repository.OrderRepository;
import uk.telecom.o2c.service.OrderService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credit")
@RequiredArgsConstructor
public class CreditController {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final OrderService orderService;

    /** Orders currently in the credit-check queue */
    @GetMapping("/queue")
    public List<Order> queue() {
        return orderRepository.findByStatus(Order.OrderStatus.CREDIT_CHECK);
    }

    /** All customers with their credit profiles */
    @GetMapping("/customers")
    public List<Customer> customers() {
        return customerRepository.findAll();
    }

    /** Approve or decline a credit check */
    @PostMapping("/{orderId}/decide")
    public ResponseEntity<Order> decide(@PathVariable String orderId,
                                        @RequestBody Map<String, String> body) {
        String decision = body.getOrDefault("decision", "APPROVED").toUpperCase();
        if ("APPROVED".equals(decision)) {
            return ResponseEntity.ok(orderService.approveCreditCheck(orderId));
        } else {
            return ResponseEntity.ok(orderService.declineCreditCheck(orderId));
        }
    }
}
