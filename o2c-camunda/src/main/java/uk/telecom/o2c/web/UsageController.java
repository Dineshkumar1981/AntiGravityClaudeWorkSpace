package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.UsageRecord;
import uk.telecom.o2c.service.UsageService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageService usageService;

    @GetMapping("/cdrs")
    public List<UsageRecord> getAll() {
        return usageService.getAll();
    }

    @GetMapping("/anomalies")
    public List<UsageRecord> getAnomalies() {
        return usageService.getAnomalies();
    }

    @PostMapping("/simulate")
    public ResponseEntity<List<UsageRecord>> simulate(@RequestBody(required = false) Map<String, Object> body) {
        int count = body != null ? Integer.parseInt(body.getOrDefault("count", "10").toString()) : 10;
        return ResponseEntity.ok(usageService.simulateBatch(count));
    }
}
