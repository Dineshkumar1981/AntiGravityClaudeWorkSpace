package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.Customer;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerId(String customerId);
}
