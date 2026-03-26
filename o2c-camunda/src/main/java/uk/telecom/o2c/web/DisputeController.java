package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.Dispute;
import uk.telecom.o2c.service.DisputeService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @GetMapping
    public List<Dispute> getAll() {
        return disputeService.getAllDisputes();
    }

    @PostMapping
    public ResponseEntity<Dispute> raise(@RequestBody Map<String, Object> body) {
        String invoiceId   = (String) body.get("invoiceId");
        String category    = (String) body.get("category");
        String description = (String) body.getOrDefault("description", "");
        BigDecimal amount  = new BigDecimal(body.getOrDefault("amount", "0").toString());
        return ResponseEntity.ok(disputeService.raiseDispute(invoiceId, category, description, amount));
    }

    @PutMapping("/{disputeId}/resolve")
    public ResponseEntity<Dispute> resolve(@PathVariable String disputeId,
                                           @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(disputeService.resolveDispute(disputeId, body.get("decision")));
    }
}
