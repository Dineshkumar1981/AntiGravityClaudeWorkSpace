# O2C Platform — Camunda 7 Edition

Hyperautomated Order-to-Cash platform for UK Telecom, powered by **Camunda 7 BPM** embedded in Spring Boot.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Spring Boot 2.7                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  REST API    │  │  Camunda 7   │  │  H2 / Postgres│  │
│  │  /api/**     │  │  Engine      │  │  (JPA)        │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Camunda Webapps: /camunda/app/cockpit           │    │
│  │                   /camunda/app/tasklist          │    │
│  │                   /camunda/app/admin             │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         ↑ REST calls
┌─────────────────────────┐
│  Frontend (static SPA)  │
│  HTML + JS (bpmn-js)    │
└─────────────────────────┘
```

## Quick Start

```bash
cd o2c-camunda
mvn spring-boot:run
```

Then open:
- **O2C App**: http://localhost:8080  (login: analyst / analyst)
- **Camunda Cockpit**: http://localhost:8080/camunda/app/cockpit  (login: admin / admin)
- **Camunda Tasklist**: http://localhost:8080/camunda/app/tasklist  (login: admin / admin)
- **H2 Console**: http://localhost:8080/h2-console  (JDBC URL: `jdbc:h2:mem:o2cdb`)

## BPM Processes

| Process Key | Name | Trigger |
|---|---|---|
| `proc_o2c` | Order-to-Cash Main | New order created via API |
| `proc_dunning` | Collections & Dunning | Invoice becomes overdue |
| `proc_dispute` | Dispute Resolution | Customer raises dispute |

## JavaDelegate Implementations

| Delegate | Task | Business Logic |
|---|---|---|
| `FraudScreeningDelegate` | `t_fraud` | AI fraud score 0-100, flags if >70 |
| `ProvisionServiceDelegate` | `t_provision` | Sets order PROVISIONING → ACTIVE |
| `GenerateInvoiceDelegate` | `t_billing` | Creates Invoice with UK VAT 20% |
| `RecogniseRevenueDelegate` | `t_revenue` | IFRS 15 straight-line recognition |
| `SuspendServiceDelegate` | `dun_t4` | Suspends service, FCA check |
| `IssueCreditNoteDelegate` | `dis_credit` | Creates credit note, reduces balance |
| `RootCauseAnalysisDelegate` | `dis_rca` | Records root cause, closes dispute |

## Production (PostgreSQL)

```bash
export DB_HOST=your-postgres-host
export DB_NAME=o2c
export DB_USER=o2c_user
export DB_PASS=your-password
mvn spring-boot:run -Dspring.profiles.active=prod
```
