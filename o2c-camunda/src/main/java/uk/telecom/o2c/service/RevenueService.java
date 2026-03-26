package uk.telecom.o2c.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.domain.RevenueRecord;
import uk.telecom.o2c.repository.OrderRepository;
import uk.telecom.o2c.repository.RevenueRecordRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueService {

    private final RevenueRecordRepository revenueRepo;
    private final OrderRepository orderRepo;

    @Transactional
    public RevenueRecord createRecord(String orderId, int contractMonths) {
        Order order = orderRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        long count = revenueRepo.count() + 1;
        String rrId = String.format("RR-%04d", count);

        BigDecimal contractValue = order.getRecurringGross()
                .multiply(BigDecimal.valueOf(contractMonths))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal monthlyRecognition = contractValue
                .divide(BigDecimal.valueOf(contractMonths), 2, RoundingMode.HALF_UP);

        RevenueRecord rr = RevenueRecord.builder()
                .rrId(rrId)
                .order(order)
                .customer(order.getCustomer())
                .productName(order.getProductName())
                .contractMonths(contractMonths)
                .contractValueGbp(contractValue)
                .recognisedGbp(monthlyRecognition)
                .deferredGbp(contractValue.subtract(monthlyRecognition))
                .period(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")))
                .status(RevenueRecord.RecognitionStatus.ACTIVE)
                .build();

        revenueRepo.save(rr);
        log.info("Revenue record {} created — contract value GBP {}, monthly recognition GBP {}",
                rrId, contractValue, monthlyRecognition);
        return rr;
    }

    @Transactional
    public void runPeriodClose() {
        String period = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<RevenueRecord> active = revenueRepo.findByStatus(RevenueRecord.RecognitionStatus.ACTIVE);
        for (RevenueRecord rr : active) {
            BigDecimal monthly = rr.getContractValueGbp()
                    .divide(BigDecimal.valueOf(rr.getContractMonths()), 2, RoundingMode.HALF_UP);
            BigDecimal newDeferred = rr.getDeferredGbp().subtract(monthly).max(BigDecimal.ZERO);
            BigDecimal newRecognised = rr.getRecognisedGbp().add(monthly);
            rr.setDeferredGbp(newDeferred);
            rr.setRecognisedGbp(newRecognised);
            rr.setPeriod(period);
            if (newDeferred.compareTo(BigDecimal.ZERO) == 0) {
                rr.setStatus(RevenueRecord.RecognitionStatus.CLOSED);
            }
            revenueRepo.save(rr);
        }
        log.info("Period close for {} — processed {} records", period, active.size());
    }

    public List<RevenueRecord> getAll() {
        return revenueRepo.findAllByOrderByPeriodDesc();
    }

    public BigDecimal getTotalDeferred() {
        return revenueRepo.findAll().stream()
                .map(RevenueRecord::getDeferredGbp)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getTotalRecognised() {
        return revenueRepo.findAll().stream()
                .map(RevenueRecord::getRecognisedGbp)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
