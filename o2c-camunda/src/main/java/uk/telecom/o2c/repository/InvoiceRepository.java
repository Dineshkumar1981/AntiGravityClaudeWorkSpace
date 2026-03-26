package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.Invoice;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceId(String invoiceId);
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);
    List<Invoice> findByStatusIn(List<Invoice.InvoiceStatus> statuses);
    List<Invoice> findAllByOrderByCreatedAtDesc();
    List<Invoice> findByCustomer_CustomerIdOrderByCreatedAtDesc(String customerId);
    long countByStatus(Invoice.InvoiceStatus status);
}
