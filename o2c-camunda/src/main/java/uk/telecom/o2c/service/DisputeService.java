package uk.telecom.o2c.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.telecom.o2c.domain.Dispute;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.repository.DisputeRepository;
import uk.telecom.o2c.repository.InvoiceRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final InvoiceRepository invoiceRepository;
    private final RuntimeService runtimeService;
    private final TaskService taskService;

    @Transactional
    public Dispute raiseDispute(String invoiceId, String category, String description, BigDecimal amount) {
        Invoice invoice = invoiceRepository.findByInvoiceId(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        long count = disputeRepository.count() + 1;
        String disputeId = String.format("DIS-%04d", count);

        Dispute dispute = Dispute.builder()
                .disputeId(disputeId)
                .invoice(invoice)
                .customer(invoice.getCustomer())
                .category(Dispute.DisputeCategory.valueOf(category.toUpperCase().replace("-", "_")))
                .description(description)
                .amountDisputed(amount)
                .status(Dispute.DisputeStatus.OPEN)
                .priority(amount.compareTo(BigDecimal.valueOf(100)) > 0 ? Dispute.Priority.HIGH : Dispute.Priority.MEDIUM)
                .build();

        disputeRepository.save(dispute);

        invoice.setStatus(Invoice.InvoiceStatus.DISPUTED);
        invoiceRepository.save(invoice);

        // Start Camunda dispute resolution process
        Map<String, Object> vars = new HashMap<>();
        vars.put("disputeId", disputeId);
        vars.put("invoiceId", invoiceId);
        vars.put("amountDisputed", amount.doubleValue());

        var instance = runtimeService.startProcessInstanceByKey("proc_dispute", disputeId, vars);
        dispute.setCamundaProcessInstanceId(instance.getProcessInstanceId());
        disputeRepository.save(dispute);

        log.info("Dispute {} raised, Camunda process {} started", disputeId, instance.getProcessInstanceId());
        return dispute;
    }

    @Transactional
    public Dispute resolveDispute(String disputeId, String decision) {
        Dispute dispute = disputeRepository.findByDisputeId(disputeId)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + disputeId));

        boolean upheld = "UPHELD".equalsIgnoreCase(decision);

        if (dispute.getCamundaProcessInstanceId() != null) {
            // Complete investigation task
            List<Task> tasks = taskService.createTaskQuery()
                    .processInstanceId(dispute.getCamundaProcessInstanceId())
                    .list();

            if (!tasks.isEmpty()) {
                Map<String, Object> vars = new HashMap<>();
                vars.put("disputionDecision", decision.toUpperCase());
                taskService.complete(tasks.get(0).getId(), vars);
            }
        }

        dispute.setStatus(upheld ? Dispute.DisputeStatus.UPHELD : Dispute.DisputeStatus.REJECTED);
        disputeRepository.save(dispute);
        return dispute;
    }

    public List<Dispute> getAllDisputes() {
        return disputeRepository.findAllByOrderByRaisedAtDesc();
    }
}
