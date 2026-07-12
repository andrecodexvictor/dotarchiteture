# Taxonomy: Risk Levels

Risk classification criteria for architectural designs.

## Risk Categories

### Low Risk (Baixo Risco)
* **Description**: Decisions that are easy to reverse and have minimal impact on execution.
* **Example**: Choosing a local caching library inside a single service.

### Medium Risk (Médio Risco)
* **Description**: Decisions requiring refactoring but isolated to a single service.
* **Example**: Choosing between TypeORM and Prisma in a Node application.

### High Risk (Alto Risco)
* **Description**: Decisions that affect multiple teams or systems, requiring significant redesign if changed.
* **Example**: Choosing a Modular Monolith instead of simple Monolith.

### Critical Risk (Risco Crítico)
* **Description**: Decisive, irreversible, and highly complex architectural choices that can break business continuity.
* **Example**: Migrating a legacy monolith to hundreds of microservices.
