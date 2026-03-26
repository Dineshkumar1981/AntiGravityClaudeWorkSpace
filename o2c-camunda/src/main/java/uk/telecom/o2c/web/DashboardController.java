package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uk.telecom.o2c.domain.Invoice;
import uk.telecom.o2c.domain.Order;
import uk.telecom.o2c.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final DisputeRepository disputeRepository;
    private final CollectionRepository collectionRepository;
    private final RevenueRecordRepository revenueRepository;

    @GetMapping("/kpis")
    public Map<String, Object> kpis() {
        List<Order> allOrders     = orderRepository.findAll();
        List<Invoice> allInvoices = invoiceRepository.findAll();

        long total   = allOrders.size();
        long active  = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.ACTIVE).count();
        long noFraud = allOrders.stream().filter(o -> Boolean.FALSE.equals(o.getFraudFlagged())).count();
        double stpRate = total > 0 ? (noFraud * 100.0 / total) : 0;

        long overdue   = invoiceRepository.findByStatus(Invoice.InvoiceStatus.OVERDUE).size();
        long disputes  = disputeRepository.findAll().stream()
                .filter(d -> d.getStatus() == uk.telecom.o2c.domain.Dispute.DisputeStatus.OPEN
                          || d.getStatus() == uk.telecom.o2c.domain.Dispute.DisputeStatus.UNDER_REVIEW)
                .count();

        BigDecimal totalDeferred = revenueRepository.findAll().stream()
                .map(r -> r.getDeferredGbp() != null ? r.getDeferredGbp() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRecognised = revenueRepository.findAll().stream()
                .map(r -> r.getRecognisedGbp() != null ? r.getRecognisedGbp() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // DSO = (receivables / revenue) * 30
        BigDecimal receivables = allInvoices.stream()
                .map(i -> i.getBalanceGbp() != null ? i.getBalanceGbp() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int dso = totalRecognised.compareTo(BigDecimal.ZERO) > 0
                ? receivables.multiply(BigDecimal.valueOf(30))
                        .divide(totalRecognised, 0, RoundingMode.HALF_UP).intValue()
                : 0;

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("totalOrders", total);
        kpis.put("activeOrders", active);
        kpis.put("stpRate", Math.round(stpRate * 10) / 10.0);
        kpis.put("dso", dso);
        kpis.put("overdueInvoices", overdue);
        kpis.put("openDisputes", disputes);
        kpis.put("totalDeferred", totalDeferred);
        kpis.put("totalRecognised", totalRecognised);
        kpis.put("activeCollections", collectionRepository.findByStatus(
                uk.telecom.o2c.domain.Collection.CollectionStatus.ACTIVE).size());
        return kpis;
    }
}
