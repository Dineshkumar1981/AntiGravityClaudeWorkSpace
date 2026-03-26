package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.UsageRecord;

import java.util.List;
import java.util.Optional;

public interface UsageRecordRepository extends JpaRepository<UsageRecord, Long> {
    Optional<UsageRecord> findByCdrId(String cdrId);
    List<UsageRecord> findByCustomer_CustomerIdOrderByRecordedAtDesc(String customerId);
    List<UsageRecord> findByBillingPeriodOrderByRecordedAtDesc(String billingPeriod);
    List<UsageRecord> findByAnomalyFlagTrueOrderByRecordedAtDesc();
    List<UsageRecord> findAllByOrderByRecordedAtDesc();
}
