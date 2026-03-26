package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.Payment;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentId(String paymentId);
    List<Payment> findAllByOrderByCreatedAtDesc();
    List<Payment> findAllByOrderByPaymentDateDesc();
    List<Payment> findByCustomer_CustomerIdOrderByPaymentDateDesc(String customerId);
    long countByMethod(Payment.PaymentMethod method);
}
