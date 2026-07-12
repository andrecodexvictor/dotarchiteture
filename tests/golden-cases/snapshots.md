# Golden Cases Snapshots

Coleção de cenários estáveis e saídas de referência esperadas da engine de decisão para evitar regressão funcional.

## Caso 01: MVP Simples (Solo Dev)
* **Entrada**: 1 Dev, Junior, Baixa Complexidade, Escala Baixa.
* **Saída Esperada**: Monolith + MVC.

## Caso 02: SaaS Financeiro Complexo (Small Squad)
* **Entrada**: 4 Devs, Advanced, Complexidade Alta, Escala Média, Auditabilidade Ativa.
* **Saída Esperada**: Modular Monolith + Hexagonal + Repository Pattern & Value Objects.

## Caso 03: Big Enterprise Migration (Multi-Squad)
* **Entrada**: 20 Devs, Advanced, Complexidade Alta, Escala Alta, Disponibilidade Alta.
* **Saída Esperada**: Microservices + Hexagonal + CQRS.
