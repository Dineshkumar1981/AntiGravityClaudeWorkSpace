package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uk.telecom.o2c.domain.Collection;
import uk.telecom.o2c.service.CollectionService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @GetMapping
    public List<Collection> getActive() {
        return collectionService.getActiveCollections();
    }

    @PostMapping("/start-dunning")
    public ResponseEntity<Collection> startDunning(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(collectionService.startDunning(body.get("invoiceId")));
    }

    @PostMapping("/{collectionId}/escalate")
    public ResponseEntity<Collection> escalate(@PathVariable String collectionId) {
        return ResponseEntity.ok(collectionService.escalate(collectionId));
    }

    @PostMapping("/{collectionId}/resolve")
    public ResponseEntity<Collection> resolve(@PathVariable String collectionId) {
        return ResponseEntity.ok(collectionService.resolve(collectionId));
    }

    @PostMapping("/run-cycle")
    public ResponseEntity<Map<String, Object>> runCycle() {
        List<Collection> active = collectionService.getActiveCollections();
        return ResponseEntity.ok(Map.of("processed", active.size(), "status", "Dunning cycle complete"));
    }
}
