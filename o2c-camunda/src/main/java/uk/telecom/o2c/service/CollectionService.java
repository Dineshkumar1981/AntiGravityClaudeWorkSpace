package uk.telecom.o2c.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.telecom.o2c.domain.Collection;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.repository.CollectionRepository;
import uk.telecom.o2c.repository.InvoiceRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final InvoiceRepository invoiceRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;

    @Transactional
    public Collection startDunning(String invoiceId) {
        Invoice invoice = invoiceRepository.findByInvoiceId(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        long count = collectionRepository.count() + 1;
        String collectionId = String.format("COL-%04d", count);

        int daysOverdue = (int) ChronoUnit.DAYS.between(invoice.getDueDate(), LocalDate.now());

        Collection col = Collection.builder()
                .collectionId(collectionId)
                .invoice(invoice)
                .customer(invoice.getCustomer())
                .amountGbp(invoice.getBalanceGbp())
                .daysOverdue(Math.max(0, daysOverdue))
                .dunningStage(1)
                .channel("EMAIL")
                .aiSegment("STANDARD")
                .vulnerableFlag(invoice.getCustomer().getVulnerableFlag())
                .status(Collection.CollectionStatus.ACTIVE)
                .build();

        collectionRepository.save(col);

        Map<String, Object> vars = new HashMap<>();
        vars.put("invoiceId", invoiceId);
        vars.put("collectionId", collectionId);
        vars.put("paymentReceived", false);

        var instance = runtimeService.startProcessInstanceByKey("proc_dunning", collectionId, vars);
        col.setCamundaProcessInstanceId(instance.getProcessInstanceId());
        collectionRepository.save(col);

        log.info("Dunning started for invoice {}, collection {}", invoiceId, collectionId);
        return col;
    }

    @Transactional
    public Collection escalate(String collectionId) {
        Collection col = collectionRepository.findByCollectionId(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found: " + collectionId));

        if (Boolean.TRUE.equals(col.getVulnerableFlag())) {
            throw new RuntimeException("Cannot auto-escalate — FCA vulnerable customer protection active");
        }

        int nextStage = Math.min(col.getDunningStage() + 1, 4);
        col.setDunningStage(nextStage);
        collectionRepository.save(col);

        if (col.getCamundaProcessInstanceId() != null) {
            List<Task> tasks = taskService.createTaskQuery()
                    .processInstanceId(col.getCamundaProcessInstanceId())
                    .list();
            if (!tasks.isEmpty()) {
                Map<String, Object> vars = new HashMap<>();
                vars.put("paymentReceived", false);
                taskService.complete(tasks.get(0).getId(), vars);
            }
        }

        return col;
    }

    @Transactional
    public Collection resolve(String collectionId) {
        Collection col = collectionRepository.findByCollectionId(collectionId)
                .orElseThrow(() -> new RuntimeException("Collection not found: " + collectionId));

        col.setStatus(Collection.CollectionStatus.RESOLVED);
        collectionRepository.save(col);

        if (col.getCamundaProcessInstanceId() != null) {
            List<Task> tasks = taskService.createTaskQuery()
                    .processInstanceId(col.getCamundaProcessInstanceId())
                    .list();
            if (!tasks.isEmpty()) {
                Map<String, Object> vars = new HashMap<>();
                vars.put("paymentReceived", true);
                taskService.complete(tasks.get(0).getId(), vars);
            }
        }

        return col;
    }

    public List<Collection> getActiveCollections() {
        return collectionRepository.findByStatus(Collection.CollectionStatus.ACTIVE);
    }
}
