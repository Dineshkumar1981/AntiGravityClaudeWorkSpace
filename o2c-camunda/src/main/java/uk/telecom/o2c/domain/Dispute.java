package uk.telecom.o2c.domain;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Dispute {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String disputeId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private DisputeCategory category;  // BILLING_ERROR, DUPLICATE_CHARGE, SERVICE_NOT_RECEIVED, OTHER

    @Column(length = 1000)
    private String description;

    private BigDecimal amountDisputed;

    @Enumerated(EnumType.STRING)
    private DisputeStatus status;  // OPEN, UNDER_REVIEW, UPHELD, REJECTED, RESOLVED

    @Enumerated(EnumType.STRING)
    private Priority priority;     // HIGH, MEDIUM, LOW

    private LocalDateTime raisedAt;
    private LocalDateTime slaBreachAt;
    private BigDecimal creditAmountGbp;
    private String rootCause;
    private String camundaProcessInstanceId;

    @PrePersist
    public void prePersist() {
        raisedAt = LocalDateTime.now();
        slaBreachAt = raisedAt.plusDays(5);
        if (status == null) status = DisputeStatus.OPEN;
    }

    public enum DisputeCategory { BILLING_ERROR, DUPLICATE_CHARGE, SERVICE_NOT_RECEIVED, OTHER }
    public enum DisputeStatus { OPEN, UNDER_REVIEW, UPHELD, REJECTED, RESOLVED }
    public enum Priority { HIGH, MEDIUM, LOW }
}
