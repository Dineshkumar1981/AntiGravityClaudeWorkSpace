package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.RevenueRecord;
import uk.telecom.o2c.service.RevenueService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/revenue")
@RequiredArgsConstructor
public class RevenueController {

    private final RevenueService revenueService;

    @GetMapping
    public List<RevenueRecord> getAll() {
        return revenueService.getAll();
    }

    @PostMapping("/record")
    public ResponseEntity<RevenueRecord> createRecord(@RequestBody Map<String, Object> body) {
        String orderId = (String) body.get("orderId");
        int months = Integer.parseInt(body.getOrDefault("contractMonths", "24").toString());
        return ResponseEntity.ok(revenueService.createRecord(orderId, months));
    }

    @PostMapping("/period-close")
    public ResponseEntity<Map<String, Object>> periodClose() {
        revenueService.runPeriodClose();
        return ResponseEntity.ok(Map.of(
                "status", "Period close complete",
                "totalDeferred",   revenueService.getTotalDeferred(),
                "totalRecognised", revenueService.getTotalRecognised()
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, BigDecimal>> summary() {
        return ResponseEntity.ok(Map.of(
                "totalDeferred",   revenueService.getTotalDeferred(),
                "totalRecognised", revenueService.getTotalRecognised()
        ));
    }
}
