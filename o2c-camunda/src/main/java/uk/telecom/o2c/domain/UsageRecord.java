package uk.telecom.o2c.domain;

import lombok.*;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_records")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UsageRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String cdrId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private String msisdn;

    @Enumerated(EnumType.STRING)
    private ServiceType serviceType; // VOICE, SMS, DATA

    private Integer durationSeconds;
    private Long dataVolumeKb;
    private String destination;

    private BigDecimal ratedNetGbp;
    private BigDecimal ratedVatGbp;

    private Boolean anomalyFlag = false;
    private String anomalyReason;

    private String billingPeriod; // e.g. "2026-03"
    private LocalDateTime recordedAt;

    @PrePersist
    public void prePersist() {
        if (recordedAt == null) recordedAt = LocalDateTime.now();
        if (anomalyFlag == null) anomalyFlag = false;
    }

    public enum ServiceType { VOICE, SMS, DATA }
}
