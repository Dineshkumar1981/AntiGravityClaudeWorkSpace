package uk.telecom.o2c.domain;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "revenue_records")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RevenueRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String rrId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private String productName;
    private Integer contractMonths;
    private BigDecimal contractValueGbp;
    private BigDecimal recognisedGbp;
    private BigDecimal deferredGbp;
    private String period;

    @Enumerated(EnumType.STRING)
    private RecognitionStatus status;  // ACTIVE, CLOSED

    private LocalDateTime lastRecognitionAt;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = RecognitionStatus.ACTIVE;
    }

    public enum RecognitionStatus { ACTIVE, CLOSED }
}
