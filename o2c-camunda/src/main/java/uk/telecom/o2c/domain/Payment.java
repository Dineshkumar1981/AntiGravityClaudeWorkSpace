package uk.telecom.o2c.domain;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String paymentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private BigDecimal amountGbp;

    @Enumerated(EnumType.STRING)
    private PaymentMethod method;  // DIRECT_DEBIT, CARD, BACS, FASTER_PAYMENTS

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;  // PENDING, COLLECTED, FAILED

    private String bankRef;
    private LocalDate paymentDate;
    private LocalDateTime reconciledAt;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = PaymentStatus.PENDING;
    }

    public enum PaymentMethod { DIRECT_DEBIT, CARD, BACS, FASTER_PAYMENTS }
    public enum PaymentStatus { PENDING, COLLECTED, FAILED }
}
