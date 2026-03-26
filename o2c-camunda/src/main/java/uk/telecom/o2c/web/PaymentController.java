package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.Payment;
import uk.telecom.o2c.service.PaymentService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public List<Payment> getAll() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/breakdown")
    public Map<String, Long> methodBreakdown() {
        return paymentService.getMethodBreakdown();
    }

    @PostMapping
    public ResponseEntity<Payment> record(@RequestBody Map<String, Object> body) {
        String invoiceId = (String) body.get("invoiceId");
        BigDecimal amount = new BigDecimal(body.getOrDefault("amount", "0").toString());
        String method = (String) body.getOrDefault("method", "CARD");
        return ResponseEntity.ok(paymentService.recordPayment(invoiceId, amount, method));
    }
}
