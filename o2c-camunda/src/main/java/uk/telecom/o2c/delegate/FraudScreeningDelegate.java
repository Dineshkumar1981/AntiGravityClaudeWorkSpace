package uk.telecom.o2c.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.OrderRepository;

import java.util.Random;

@Component("fraudScreeningDelegate")
@RequiredArgsConstructor
@Slf4j
public class FraudScreeningDelegate implements JavaDelegate {

    private final OrderRepository orderRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String orderId = (String) execution.getVariable("orderId");
        log.info("Fraud screening for order: {}", orderId);

        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // Simulate AI fraud scoring (0-100)
        int fraudScore = new Random().nextInt(100);
        boolean fraudFlagged = fraudScore > 70;

        order.setFraudScore(fraudScore);
        order.setFraudFlagged(fraudFlagged);
        if (fraudFlagged) {
            order.setStatus(Order.OrderStatus.CANCELLED);
        }
        orderRepository.save(order);

        execution.setVariable("fraudScore", fraudScore);
        execution.setVariable("fraudFlagged", fraudFlagged);

        log.info("Order {} fraud score: {} flagged: {}", orderId, fraudScore, fraudFlagged);
    }
}
