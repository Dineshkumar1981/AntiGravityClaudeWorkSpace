package uk.telecom.o2c.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.OrderRepository;

@Component("provisionServiceDelegate")
@RequiredArgsConstructor
@Slf4j
public class ProvisionServiceDelegate implements JavaDelegate {

    private final OrderRepository orderRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String orderId = (String) execution.getVariable("orderId");
        log.info("Provisioning service for order: {}", orderId);

        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setStatus(Order.OrderStatus.PROVISIONING);
        orderRepository.save(order);

        // Simulate provisioning completion
        Thread.sleep(100);
        order.setStatus(Order.OrderStatus.ACTIVE);
        orderRepository.save(order);

        execution.setVariable("provisioningComplete", true);
        log.info("Order {} provisioned successfully", orderId);
    }
}
