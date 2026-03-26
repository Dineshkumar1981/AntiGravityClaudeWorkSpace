package uk.telecom.o2c.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uk.telecom.o2c.domain.Order;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderId(String orderId);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByStatusIn(List<Order.OrderStatus> statuses);
    List<Order> findAllByOrderByCreatedAtDesc();
}
