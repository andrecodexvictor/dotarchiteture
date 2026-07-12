# Project Architectural Overview

## Decision Outcome
* **Recommended System Architecture**: **MODULAR-MONOLITH**
* **Recommended Internal Design Pattern**: **HEXAGONAL**

## Rationale / Justificativa Personalizada
Com base no contexto do projeto, avaliamos um time de **5 desenvolvedor(es)** com maturidade **intermediate**, lidando com um domínio de complexidade **medium**. Com um time médio de 5 devs, sugerimos a abordagem **modular-monolith** para facilitar a cooperação em paralelo sem a complexidade de rede e orquestração de múltiplos microsserviços. O domínio de complexidade média sugere o padrão **hexagonal**, oferecendo um bom equilíbrio entre separação de responsabilidades e agilidade de desenvolvimento. 

## Target Directory Scaffolding
Here is the recommended folder map for your internal design pattern using your target stack:

| Directory Path | Purpose / Description |
| :--- | :--- |
| `src/domain/models` | Entidades ricas de domínio contendo a lógica central de negócio (ex: user.entity.ts). |
| `src/domain/services` | Serviços de domínio que lidam com regras envolvendo múltiplos modelos. |
| `src/application/use-cases` | Casos de uso da aplicação (interatores, commands/queries) orquestrando fluxos. |
| `src/application/ports` | Interfaces TypeScript definindo contratos para banco de dados e APIs externas. |
| `src/adapters/primary` | Controladores HTTP NestJS, resolvers GraphQL ou assinantes de eventos. |
| `src/adapters/secondary` | Implementações de repositório (TypeORM, Prisma), clients HTTP ou integrações físicas. |

## Tailored Design Patterns (GoF & DDD)
Based on your team size, complexity, and availability specs, we recommend using these patterns:
* No special GoF/DDD design patterns recommended for this basic scope.

## Rejected Options & Trade-offs
* **monolith**: Um monólito seria um gargalo para a velocidade de entrega do time, deploy desacoplado ou escalabilidade horizontal.
* **microservices**: Rejeitado devido ao alto custo operacional. Recomendado apenas para times grandes (>= 15 membros) com alta complexidade.
* **event-driven**: Sistemas orientados a eventos trazem complexidade de tracing e consistência eventual que não são justificadas neste escopo.
* **serverless**: Estruturas serverless criam alto acoplamento com provedores de nuvem e gargalos de cold start que não alinham com o perfil.

## Active Alerts / Warnings
* No immediate over-engineering warnings detected.

## Date Generated
2026-07-12
