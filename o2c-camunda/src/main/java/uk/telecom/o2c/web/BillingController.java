package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.service.BillingService;
import uk.telecom.o2c.service.DisputeService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final DisputeService disputeService;

    @GetMapping("/invoices")
    public List<Invoice> getAll() {
        return billingService.getAllInvoices();
    }

    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<Invoice> getOne(@PathVariable String invoiceId) {
        return billingService.getById(invoiceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/invoices/generate")
    public ResponseEntity<Invoice> generate(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(billingService.generateInvoice(body.get("orderId")));
    }

    @PutMapping("/invoices/{invoiceId}/mark-overdue")
    public ResponseEntity<Invoice> markOverdue(@PathVariable String invoiceId) {
        return ResponseEntity.ok(billingService.markOverdue(invoiceId));
    }

    @PostMapping("/invoices/{invoiceId}/dispute")
    public ResponseEntity<?> raiseDispute(@PathVariable String invoiceId,
                                          @RequestBody Map<String, Object> body) {
        String category    = (String) body.getOrDefault("category", "BILLING_ERROR");
        String description = (String) body.getOrDefault("description", "Disputed charge");
        BigDecimal amount  = new BigDecimal(body.getOrDefault("amount", "0").toString());
        return ResponseEntity.ok(disputeService.raiseDispute(invoiceId, category, description, amount));
    }
}
