package uk.telecom.o2c.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.telecom.o2c.domain.Customer;
import uk.telecom.o2c.domain.UsageRecord;
import uk.telecom.o2c.repository.CustomerRepository;
import uk.telecom.o2c.repository.UsageRecordRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsageService {

    private final UsageRecordRepository usageRepo;
    private final CustomerRepository customerRepo;

    private static final BigDecimal VOICE_RATE_PER_MIN = new BigDecimal("0.015");
    private static final BigDecimal DATA_RATE_PER_MB  = new BigDecimal("0.005");
    private static final BigDecimal VAT_RATE           = new BigDecimal("0.20");

    @Transactional
    public List<UsageRecord> simulateBatch(int count) {
        List<Customer> customers = customerRepo.findAll();
        if (customers.isEmpty()) throw new RuntimeException("No customers to generate CDRs for");

        Random rnd = new Random();
        String period = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        long base = usageRepo.count();

        for (int i = 0; i < count; i++) {
            Customer c = customers.get(rnd.nextInt(customers.size()));
            UsageRecord.ServiceType type = UsageRecord.ServiceType.values()[rnd.nextInt(3)];

            int durationSec = type == UsageRecord.ServiceType.DATA ? 0 : rnd.nextInt(600) + 30;
            long dataKb     = type == UsageRecord.ServiceType.DATA ? (rnd.nextInt(500) + 50) * 1024L : 0;

            BigDecimal net;
            if (type == UsageRecord.ServiceType.DATA) {
                net = DATA_RATE_PER_MB.multiply(BigDecimal.valueOf(dataKb / 1024.0)).setScale(4, RoundingMode.HALF_UP);
            } else {
                net = VOICE_RATE_PER_MIN.multiply(BigDecimal.valueOf(durationSec / 60.0)).setScale(4, RoundingMode.HALF_UP);
            }
            BigDecimal vat = net.multiply(VAT_RATE).setScale(4, RoundingMode.HALF_UP);

            // Anomaly: data > 200MB or voice > 8 minutes
            boolean anomaly = (dataKb > 200 * 1024) || (durationSec > 480);
            String anomalyReason = anomaly ? (dataKb > 200 * 1024 ? "HIGH_DATA_USAGE" : "LONG_CALL") : null;

            UsageRecord record = UsageRecord.builder()
                    .cdrId(String.format("CDR-%04d", base + i + 1))
                    .customer(c)
                    .msisdn("+447" + (700000000 + rnd.nextInt(99999999)))
                    .serviceType(type)
                    .durationSeconds(durationSec)
                    .dataVolumeKb(dataKb)
                    .destination(type == UsageRecord.ServiceType.DATA ? "internet" : "07" + rnd.nextInt(999999999))
                    .ratedNetGbp(net)
                    .ratedVatGbp(vat)
                    .anomalyFlag(anomaly)
                    .anomalyReason(anomalyReason)
                    .billingPeriod(period)
                    .recordedAt(LocalDateTime.now().minusMinutes(rnd.nextInt(1440)))
                    .build();

            usageRepo.save(record);
        }
        log.info("Simulated {} CDRs for period {}", count, period);
        return usageRepo.findByBillingPeriodOrderByRecordedAtDesc(period);
    }

    public List<UsageRecord> getAll() { return usageRepo.findAllByOrderByRecordedAtDesc(); }
    public List<UsageRecord> getAnomalies() { return usageRepo.findByAnomalyFlagTrueOrderByRecordedAtDesc(); }
}
