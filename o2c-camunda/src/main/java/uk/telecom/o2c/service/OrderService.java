package uk.telecom.o2c.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.telecom.o2c.domain.Customer;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.CustomerRepository;
import uk.telecom.o2c.repository.OrderRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;

    @Transactional
    public Order createOrder(String customerId, String productId, String productName,
                             String channel, BigDecimal recurringNet) {

        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));

        long count = orderRepository.count() + 1;
        String orderId = String.format("ORD-%04d", count);

        BigDecimal vat   = recurringNet.multiply(BigDecimal.valueOf(0.20));
        BigDecimal gross = recurringNet.add(vat);

        Order order = Order.builder()
                .orderId(orderId)
                .customer(customer)
                .channel(Order.Channel.valueOf(channel.toUpperCase().replace(" ", "_").replace("-", "_")))
                .type(Order.OrderType.NEW)
                .status(Order.OrderStatus.NEW)
                .productId(productId)
                .productName(productName)
                .recurringNet(recurringNet)
                .recurringVat(vat)
                .recurringGross(gross)
                .build();

        orderRepository.save(order);

        // Start Camunda O2C process
        Map<String, Object> vars = new HashMap<>();
        vars.put("orderId", orderId);
        vars.put("customerId", customerId);
        vars.put("productId", productId);
        vars.put("orderAgent", "analyst");

        var instance = runtimeService.startProcessInstanceByKey("proc_o2c", orderId, vars);
        order.setCamundaProcessInstanceId(instance.getProcessInstanceId());
        orderRepository.save(order);

        // Auto-complete the Order Capture user task (for demo — in production an agent would complete it)
        List<Task> tasks = taskService.createTaskQuery()
                .processInstanceId(instance.getProcessInstanceId())
                .taskDefinitionKey("t_capture")
                .list();
        if (!tasks.isEmpty()) {
            Map<String, Object> captureVars = new HashMap<>();
            captureVars.put("gdprConsent", true);
            taskService.complete(tasks.get(0).getId(), captureVars);
        }

        log.info("Order {} created, Camunda process {} started", orderId, instance.getProcessInstanceId());
        return orderRepository.findByOrderId(orderId).orElse(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order approveCreditCheck(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setCreditDecision(Order.CreditDecision.APPROVED);
        order.setStatus(Order.OrderStatus.PROVISIONING);
        orderRepository.save(order);

        // Complete the credit assessment user task
        if (order.getCamundaProcessInstanceId() != null) {
            List<Task> tasks = taskService.createTaskQuery()
                    .processInstanceId(order.getCamundaProcessInstanceId())
                    .taskDefinitionKey("t_credit")
                    .list();
            if (!tasks.isEmpty()) {
                Map<String, Object> vars = new HashMap<>();
                vars.put("creditApproved", true);
                taskService.complete(tasks.get(0).getId(), vars);
            }
        }
        return order;
    }

    @Transactional
    public Order declineCreditCheck(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setCreditDecision(Order.CreditDecision.DECLINED);
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);

        if (order.getCamundaProcessInstanceId() != null) {
            List<Task> tasks = taskService.createTaskQuery()
                    .processInstanceId(order.getCamundaProcessInstanceId())
                    .taskDefinitionKey("t_credit")
                    .list();
            if (!tasks.isEmpty()) {
                Map<String, Object> vars = new HashMap<>();
                vars.put("creditApproved", false);
                taskService.complete(tasks.get(0).getId(), vars);
            }
        }
        return order;
    }
}
