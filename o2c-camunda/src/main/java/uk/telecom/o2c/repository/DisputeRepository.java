package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.Dispute;
import java.util.List;
import java.util.Optional;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    Optional<Dispute> findByDisputeId(String disputeId);
    List<Dispute> findByStatus(Dispute.DisputeStatus status);
    List<Dispute> findAllByOrderByRaisedAtDesc();
}
