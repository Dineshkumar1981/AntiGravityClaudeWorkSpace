package uk.telecom.o2c.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import uk.telecom.o2c.domain.*;
import uk.telecom.o2c.repository.*;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CustomerRepository customerRepo;
    private final OrderRepository orderRepo;
    private final InvoiceRepository invoiceRepo;

    @Override
    public void run(String... args) throws Exception {
        if (customerRepo.count() > 0) {
            log.info("Data already seeded — skipping.");
            return;
        }

        log.info("Seeding O2C demo data...");

        Customer c1 = customerRepo.save(Customer.builder()
                .customerId("CUST-001").name("James Thornton").email("james@example.com")
                .phone("+44 7700 900001").type(Customer.CustomerType.CONSUMER)
                .creditScore(780).creditLimit(BigDecimal.valueOf(2000)).riskBand(Customer.RiskBand.LOW)
                .gdprConsent(true).vulnerableFlag(false).build());

        Customer c2 = customerRepo.save(Customer.builder()
                .customerId("CUST-002").name("Sarah Patel").email("sarah@example.com")
                .phone("+44 7700 900002").type(Customer.CustomerType.CONSUMER)
                .creditScore(620).creditLimit(BigDecimal.valueOf(1000)).riskBand(Customer.RiskBand.MEDIUM)
                .gdprConsent(true).vulnerableFlag(false).build());

        Customer c3 = customerRepo.save(Customer.builder()
                .customerId("CUST-003").name("David Williams").email("david@example.com")
                .phone("+44 7700 900003").type(Customer.CustomerType.SME)
                .creditScore(710).creditLimit(BigDecimal.valueOf(5000)).riskBand(Customer.RiskBand.LOW)
                .gdprConsent(true).vulnerableFlag(false).build());

        Customer c4 = customerRepo.save(Customer.builder()
                .customerId("CUST-004").name("Emma Johnson").email("emma@example.com")
                .phone("+44 7700 900004").type(Customer.CustomerType.CONSUMER)
                .creditScore(540).creditLimit(BigDecimal.valueOf(500)).riskBand(Customer.RiskBand.HIGH)
                .gdprConsent(true).vulnerableFlag(true).build());  // Vulnerable — FCA protection

        Customer c5 = customerRepo.save(Customer.builder()
                .customerId("CUST-005").name("Michael Brown").email("michael@example.com")
                .phone("+44 7700 900005").type(Customer.CustomerType.ENTERPRISE)
                .creditScore(820).creditLimit(BigDecimal.valueOf(20000)).riskBand(Customer.RiskBand.LOW)
                .gdprConsent(true).vulnerableFlag(false).build());

        log.info("Seeded 5 customers. Orders will be created via the API or Camunda process start.");
    }
}
