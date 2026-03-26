package uk.telecom.o2c.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.InvoiceRepository;
import uk.telecom.o2c.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component("generateInvoiceDelegate")
@RequiredArgsConstructor
@Slf4j
public class GenerateInvoiceDelegate implements JavaDelegate {

    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String orderId = (String) execution.getVariable("orderId");
        log.info("Generating invoice for order: {}", orderId);

        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        long count = invoiceRepository.count() + 1;
        String invoiceId = String.format("INV-%04d", count);
        String invoiceNumber = "UK-" + LocalDate.now().getYear() + "-" + String.format("%04d", count);

        BigDecimal net = order.getRecurringNet() != null ? order.getRecurringNet() : BigDecimal.valueOf(25);
        BigDecimal vat = net.multiply(BigDecimal.valueOf(0.20));
        BigDecimal gross = net.add(vat);

        Invoice invoice = Invoice.builder()
                .invoiceId(invoiceId)
                .invoiceNumber(invoiceNumber)
                .customer(order.getCustomer())
                .order(order)
                .periodStart(LocalDate.now().withDayOfMonth(1))
                .periodEnd(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()))
                .dueDate(LocalDate.now().plusDays(30))
                .status(Invoice.InvoiceStatus.ISSUED)
                .type(Invoice.InvoiceType.RECURRING)
                .netGbp(net)
                .vatGbp(vat)
                .grossGbp(gross)
                .paidGbp(BigDecimal.ZERO)
                .balanceGbp(gross)
                .build();

        invoiceRepository.save(invoice);
        execution.setVariable("invoiceId", invoiceId);
        log.info("Invoice {} generated for order {}", invoiceId, orderId);
    }
}
