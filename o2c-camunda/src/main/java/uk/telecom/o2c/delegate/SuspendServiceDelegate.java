package uk.telecom.o2c.delegate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import uk.telecom.o2c.domain.Collection;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.CollectionRepository;
import uk.telecom.o2c.repository.InvoiceRepository;
import uk.telecom.o2c.repository.OrderRepository;

@Component("suspendServiceDelegate")
@RequiredArgsConstructor
@Slf4j
public class SuspendServiceDelegate implements JavaDelegate {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final CollectionRepository collectionRepository;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String invoiceId = (String) execution.getVariable("invoiceId");
        log.warn("Suspending service for invoice: {}", invoiceId);

        Invoice invoice = invoiceRepository.findByInvoiceId(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        // Suspend the related order
        if (invoice.getOrder() != null) {
            Order order = invoice.getOrder();
            // Check FCA vulnerable customer protection
            if (Boolean.TRUE.equals(order.getCustomer().getVulnerableFlag())) {
                log.warn("Vulnerable customer {} — suspension blocked per FCA guidelines",
                        order.getCustomer().getCustomerId());
                execution.setVariable("suspensionBlocked", true);
                return;
            }
            order.setStatus(Order.OrderStatus.SUSPENDED);
            orderRepository.save(order);
        }

        // Update collection record
        collectionRepository.findByInvoice_InvoiceId(invoiceId).ifPresent(col -> {
            col.setDunningStage(4);
            col.setStatus(Collection.CollectionStatus.SUSPENDED);
            collectionRepository.save(col);
        });

        execution.setVariable("suspensionBlocked", false);
        log.warn("Service suspended for invoice {}", invoiceId);
    }
}
