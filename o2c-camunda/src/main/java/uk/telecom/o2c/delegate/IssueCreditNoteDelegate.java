package uk.telecom.o2c.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import uk.telecom.o2c.domain.Dispute;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.repository.DisputeRepository;
import uk.telecom.o2c.repository.InvoiceRepository;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component("issueCreditNoteDelegate")
@RequiredArgsConstructor
@Slf4j
public class IssueCreditNoteDelegate implements JavaDelegate {

    private final DisputeRepository disputeRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String disputeId = (String) execution.getVariable("disputeId");
        log.info("Issuing credit note for dispute: {}", disputeId);

        Dispute dispute = disputeRepository.findByDisputeId(disputeId)
                .orElseThrow(() -> new RuntimeException("Dispute not found: " + disputeId));

        BigDecimal creditAmount = dispute.getAmountDisputed();
        dispute.setCreditAmountGbp(creditAmount);
        dispute.setStatus(Dispute.DisputeStatus.UPHELD);

        // Reduce original invoice balance
        Invoice invoice = dispute.getInvoice();
        BigDecimal newBalance = invoice.getBalanceGbp().subtract(creditAmount);
        invoice.setBalanceGbp(newBalance.max(BigDecimal.ZERO));
        if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
        }
        invoiceRepository.save(invoice);
        disputeRepository.save(dispute);

        execution.setVariable("creditAmountGbp", creditAmount.doubleValue());
        log.info("Credit note issued: GBP {} for dispute {}", creditAmount, disputeId);
    }
}
