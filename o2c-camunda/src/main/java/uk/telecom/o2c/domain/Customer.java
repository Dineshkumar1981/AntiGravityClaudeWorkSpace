package uk.telecom.o2c.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "customers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Customer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String customerId;   // e.g. CUST-001

    private String name;
    private String email;
    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    private CustomerType type;   // CONSUMER, SME, ENTERPRISE

    private Integer creditScore;
    private BigDecimal creditLimit;

    @Enumerated(EnumType.STRING)
    private RiskBand riskBand;   // LOW, MEDIUM, HIGH

    private Boolean gdprConsent = false;
    private Boolean vulnerableFlag = false;

    public enum CustomerType { CONSUMER, SME, ENTERPRISE }
    public enum RiskBand { LOW, MEDIUM, HIGH }
}
