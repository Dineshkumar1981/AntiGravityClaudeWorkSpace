package uk.telecom.o2c.domain;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String invoiceId;

    @Column(unique = true, nullable = false, length = 30)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    private LocalDate periodStart;
    private LocalDate periodEnd;
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;  // DRAFT, ISSUED, PAID, OVERDUE, DISPUTED

    @Enumerated(EnumType.STRING)
    private InvoiceType type;      // RECURRING, USAGE, CREDIT

    private BigDecimal netGbp;
    private BigDecimal vatGbp;
    private BigDecimal grossGbp;
    private BigDecimal paidGbp;
    private BigDecimal balanceGbp;

    private Boolean billShock = false;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = InvoiceStatus.DRAFT;
        if (paidGbp == null) paidGbp = BigDecimal.ZERO;
        if (balanceGbp == null) balanceGbp = grossGbp;
    }

    public enum InvoiceStatus { DRAFT, ISSUED, PAID, OVERDUE, DISPUTED }
    public enum InvoiceType { RECURRING, USAGE, CREDIT }
}
