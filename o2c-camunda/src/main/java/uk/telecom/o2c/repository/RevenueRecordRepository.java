package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.RevenueRecord;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface RevenueRecordRepository extends JpaRepository<RevenueRecord, Long> {
    Optional<RevenueRecord> findByRrId(String rrId);
    List<RevenueRecord> findByDeferredGbpGreaterThan(BigDecimal zero);
    List<RevenueRecord> findByStatus(RevenueRecord.RecognitionStatus status);
    List<RevenueRecord> findAllByOrderByPeriodDesc();
}
