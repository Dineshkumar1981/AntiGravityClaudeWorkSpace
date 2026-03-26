package uk.telecom.o2c.domain;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "collections")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Collection {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String collectionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private BigDecimal amountGbp;
    private Integer daysOverdue;
    private Integer dunningStage;   // 1, 2, 3, 4

    private String channel;
    private String aiSegment;

    private BigDecimal promiseToPayAmount;
    private LocalDate promiseToPayDate;
    private Boolean vulnerableFlag = false;

    @Enumerated(EnumType.STRING)
    private CollectionStatus status;  // ACTIVE, RESOLVED, SUSPENDED

    private String camundaProcessInstanceId;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = CollectionStatus.ACTIVE;
        if (dunningStage == null) dunningStage = 1;
    }

    public enum CollectionStatus { ACTIVE, RESOLVED, SUSPENDED }
}
