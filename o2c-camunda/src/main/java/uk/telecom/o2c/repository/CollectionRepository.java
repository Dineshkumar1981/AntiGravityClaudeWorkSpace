package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.Collection;
import java.util.List;
import java.util.Optional;

public interface CollectionRepository extends JpaRepository<Collection, Long> {
    Optional<Collection> findByCollectionId(String collectionId);
    Optional<Collection> findByInvoice_InvoiceId(String invoiceId);
    List<Collection> findByStatus(Collection.CollectionStatus status);
}
