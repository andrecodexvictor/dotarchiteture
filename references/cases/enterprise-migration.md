# Reference Case: Enterprise Migration

## Contexto do Caso
Empresa de logística tradicional migrando seu monólito legiado de 10 anos. O time conta com 25 desenvolvedores divididos em 4 squads (Frete, Rastreamento, Faturamento, Inventário).

## Decisões Tomadas
* **Arquitetura Física**: Microsserviços independentes implantados em AWS ECS/EKS.
* **Comunicação**: Assíncrona via Apache Kafka.
* **Isolamento de Dados**: Banco de dados exclusivo por microsserviço (Postgres e MongoDB).
* **Migração**: Padrão Strangler Fig (migrando aos poucos as funcionalidades sob novas rotas de API).
