package uk.telecom.o2c.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.domain.Payment;
import uk.telecom.o2c.repository.InvoiceRepository;
import uk.telecom.o2c.repository.PaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final RuntimeService runtimeService;

    @Transactional
    public Payment recordPayment(String invoiceId, BigDecimal amount, String method) {
        Invoice invoice = invoiceRepository.findByInvoiceId(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        long count = paymentRepository.count() + 1;
        String paymentId = String.format("PAY-%04d", count);

        Payment payment = Payment.builder()
                .paymentId(paymentId)
                .invoice(invoice)
                .customer(invoice.getCustomer())
                .amountGbp(amount)
                .method(Payment.PaymentMethod.valueOf(method.toUpperCase().replace(" ", "_").replace("-", "_")))
                .status(Payment.PaymentStatus.COLLECTED)
                .paymentDate(LocalDate.now())
                .build();

        paymentRepository.save(payment);

        // Update invoice balance
        BigDecimal newPaid    = invoice.getPaidGbp().add(amount);
        BigDecimal newBalance = invoice.getGrossGbp().subtract(newPaid);
        invoice.setPaidGbp(newPaid);
        invoice.setBalanceGbp(newBalance.max(BigDecimal.ZERO));
        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
        }
        invoiceRepository.save(invoice);

        log.info("Payment {} recorded for invoice {} — GBP {}", paymentId, invoiceId, amount);
        return payment;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc();
    }

    // Stats for the payment method bar chart
    public Map<String, Long> getMethodBreakdown() {
        Map<String, Long> result = new HashMap<>();
        for (Payment.PaymentMethod m : Payment.PaymentMethod.values()) {
            result.put(m.name(), paymentRepository.countByMethod(m));
        }
        return result;
    }
}
