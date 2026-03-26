package uk.telecom.o2c.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.domain.RevenueRecord;
import uk.telecom.o2c.repository.OrderRepository;
import uk.telecom.o2c.repository.RevenueRecordRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component("recogniseRevenueDelegate")
@RequiredArgsConstructor
@Slf4j
public class RecogniseRevenueDelegate implements JavaDelegate {

    private final OrderRepository orderRepository;
    private final RevenueRecordRepository revenueRepo;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String orderId = (String) execution.getVariable("orderId");
        log.info("IFRS 15 revenue recognition for order: {}", orderId);

        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        int contractMonths = 24;
        BigDecimal monthlyNet = order.getRecurringNet() != null ? order.getRecurringNet() : BigDecimal.valueOf(25);
        BigDecimal contractValue = monthlyNet.multiply(BigDecimal.valueOf(contractMonths));
        BigDecimal perMonth = contractValue.divide(BigDecimal.valueOf(contractMonths), 2, RoundingMode.HALF_UP);

        long count = revenueRepo.count() + 1;
        String rrId = String.format("RR-%04d", count);
        String period = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        RevenueRecord rr = RevenueRecord.builder()
                .rrId(rrId)
                .order(order)
                .customer(order.getCustomer())
                .productName(order.getProductName())
                .contractMonths(contractMonths)
                .contractValueGbp(contractValue)
                .recognisedGbp(perMonth)
                .deferredGbp(contractValue.subtract(perMonth))
                .period(period)
                .lastRecognitionAt(LocalDateTime.now())
                .build();

        revenueRepo.save(rr);

        order.setStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);

        execution.setVariable("rrId", rrId);
        execution.setVariable("recognisedGbp", perMonth.doubleValue());
        log.info("Revenue recognised: {} GBP for order {}", perMonth, orderId);
    }
}
