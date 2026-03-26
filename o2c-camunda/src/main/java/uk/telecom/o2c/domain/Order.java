package uk.telecom.o2c.domain;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String orderId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private Channel channel;     // WEB, RETAIL, APP, CONTACT_CENTRE

    @Enumerated(EnumType.STRING)
    private OrderType type;      // NEW, UPGRADE, ADDON, MIGRATION

    @Enumerated(EnumType.STRING)
    private OrderStatus status;  // NEW, VALIDATED, CREDIT_CHECK, PROVISIONING, ACTIVE, SUSPENDED, CANCELLED, COMPLETED

    private String productId;
    private String productName;

    private BigDecimal recurringNet;
    private BigDecimal recurringVat;
    private BigDecimal recurringGross;

    private Integer fraudScore;
    private Boolean fraudFlagged = false;

    @Enumerated(EnumType.STRING)
    private CreditDecision creditDecision;  // PENDING, APPROVED, REFERRED, DECLINED

    /** Links this order to the live Camunda process instance */
    private String camundaProcessInstanceId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = OrderStatus.NEW;
        if (creditDecision == null) creditDecision = CreditDecision.PENDING;
    }
    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Channel { WEB, RETAIL, APP, CONTACT_CENTRE }
    public enum OrderType { NEW, UPGRADE, ADDON, MIGRATION }
    public enum OrderStatus { NEW, VALIDATED, CREDIT_CHECK, PROVISIONING, ACTIVE, SUSPENDED, CANCELLED, COMPLETED }
    public enum CreditDecision { PENDING, APPROVED, REFERRED, DECLINED }
}
