# Reference Case: SaaS Startup

## Contexto do Caso
Startup desenvolvendo um produto de faturamento (SaaS) multi-tenant com 4 desenvolvedores seniores. O negócio exige auditoria de faturamento, baixa latência e alta disponibilidade.

## Decisões Tomadas
* **Arquitetura Física**: Monólito Modular (para evitar sobrecarga de rede no início, permitindo isolamento lógico estrito entre faturamento e subscrições).
* **Estrutura de Código**: Hexagonal (Ports & Adapters) para garantir isolamento total das regras financeiras contra dependências do gateway de pagamento (Stripe/Adyen).
* **Padrões de Integração**: Transactional Outbox (para publicar eventos de faturamento concluído assincronamente).
* **Padrões de Dados**: Caching com Redis para sessões e dados de planos ativos.
