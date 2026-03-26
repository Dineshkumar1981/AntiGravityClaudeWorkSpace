package uk.telecom.o2c.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.InvoiceRepository;
import uk.telecom.o2c.repository.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final RuntimeService runtimeService;

    @Transactional
    public Invoice generateInvoice(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        long count = invoiceRepository.count() + 1;
        String invoiceId     = String.format("INV-%04d", count);
        String invoiceNumber = String.format("UK-%d-%04d", LocalDate.now().getYear(), count);

        BigDecimal net   = order.getRecurringNet();
        BigDecimal vat   = net.multiply(BigDecimal.valueOf(0.20)).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal gross = net.add(vat);

        // Bill shock: >20% above previous invoice for this customer
        boolean billShock = false;
        List<Invoice> prev = invoiceRepository.findByCustomer_CustomerIdOrderByCreatedAtDesc(order.getCustomer().getCustomerId());
        if (!prev.isEmpty() && prev.get(0).getGrossGbp() != null) {
            BigDecimal prevGross = prev.get(0).getGrossGbp();
            if (gross.subtract(prevGross).abs().compareTo(prevGross.multiply(BigDecimal.valueOf(0.20))) > 0) {
                billShock = true;
                log.warn("Bill shock detected for order {} — gross {} vs previous {}", orderId, gross, prevGross);
            }
        }

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
                .billShock(billShock)
                .build();

        invoiceRepository.save(invoice);
        log.info("Invoice {} generated for order {}, gross GBP {}", invoiceId, orderId, gross);
        return invoice;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Invoice> getById(String invoiceId) {
        return invoiceRepository.findByInvoiceId(invoiceId);
    }

    @Transactional
    public Invoice markOverdue(String invoiceId) {
        Invoice invoice = invoiceRepository.findByInvoiceId(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));
        invoice.setStatus(Invoice.InvoiceStatus.OVERDUE);
        return invoiceRepository.save(invoice);
    }
}
