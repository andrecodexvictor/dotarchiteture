# Checklist Incremental para Aumentar a Precisão da Engine de Decisão de Arquitetura

Este documento organiza, em ordem incremental, tudo o que deve ser adicionado ao repositório para que a engine de decisão de arquitetura produza recomendações mais precisas, auditáveis e reutilizáveis.

## Ordem Incremental Recomendada

| Fase | O que entra primeiro | Por que vem primeiro |
|---|---|---|
| 1 | Contrato de entrada + taxonomia | Sem linguagem comum a engine erra por ambiguidade. |
| 2 | Catálogo de padrões + anti-patterns | Sem base de conhecimento a recomendação fica rasa. |
| 3 | Regras + scoring | Sem heurística explícita não existe precisão reproduzível. |
| 4 | Metodologias + templates | Conecta teoria a execução. |
| 5 | Casos de referência + testes | Calibra e evita regressão. |
| 6 | ADRs + métricas + governança | Mantém qualidade no longo prazo. |

---

## Detalhamento das Etapas

### Etapa 1 — Base mínima de entrada
* `project-context.md`: objetivo do sistema, tipo de produto, domínio, stakeholders, maturidade.
* `requirements/functional.md`: principais capacidades esperadas.
* `requirements/non-functional.md`: escala, segurança, observabilidade, custo, latência, disponibilidade.
* `constraints.md`: limitações técnicas, time, prazo, cloud, linguagem, compliance.
* `decision-input.schema.json`: esquema formal para a engine validar entradas.
* `glossary.md`: vocabulário canônico para reduzir ambiguidade na interpretação.

### Etapa 2 — Taxonomia de decisão
* `taxonomy/architectural-styles.md`: monólito modular, microservices, event-driven, serverless, hexagonal, clean architecture, layered.
* `taxonomy/project-types.md`: SaaS, backoffice, API pública, integração interna, biblioteca, CLI, IA agentic, automação.
* `taxonomy/quality-attributes.md`: escalabilidade, manutenibilidade, resiliência, portabilidade, segurança, custo.
* `taxonomy/risk-levels.md`: baixo, médio, alto, crítico.
* `taxonomy/decision-dimensions.md`: deployment, dados, integração, observabilidade, auth, modularidade, testes.

### Etapa 3 — Base de conhecimento de padrões
* `patterns/architectural/*.md`: cada padrão com propósito, contexto, vantagens, desvantagens, quando usar, quando evitar.
* `patterns/design/*.md`: Strategy, Factory, Adapter, Observer, Mediator, Repository, Unit of Work, CQRS etc.
* `patterns/integration/*.md`: REST, webhook, mensageria, event sourcing, saga, outbox, polling.
* `patterns/frontend/*.md`: feature-based, atomic design, container/presentational, state management.
* `patterns/data/*.md`: read replicas, sharding, caching, CQRS read model, data lake/warehouse.
* `anti-patterns/*.md`: distributed monolith, shared database indevido, god service, premature microservices.

### Etapa 4 — Regras de decisão nativas
* `rules/if-then/*.yaml`: regras legíveis para seleção de arquitetura.
* `rules/scoring-matrix/*.yaml`: pesos por atributo de qualidade e tipo de projeto.
* `rules/conflict-resolution.md`: como desempatar recomendações concorrentes.
* `rules/defaults.md`: defaults seguros quando faltarem dados.
* `rules/invariants.md`: princípios que nunca podem ser violados.
* `rules/exceptions.md`: quando quebrar um padrão conscientemente.

### Etapa 5 — Metodologias nativas
* `methodologies/ddd.md`
* `methodologies/tdd.md`
* `methodologies/bdd.md`
* `methodologies/trunk-based-development.md`
* `methodologies/git-flow.md`
* `methodologies/12-factor-app.md`
* `methodologies/adr.md`
* `methodologies/c4-model.md`
* `methodologies/arc42.md`
* `methodologies/team-topologies.md`

### Etapa 6 — Templates executáveis
* `templates/clean-architecture/`
* `templates/hexagonal/`
* `templates/modular-monolith/`
* `templates/event-driven/`
* `templates/rest-api/`
* `templates/frontend-feature-based/`
* `templates/github/`: PR template, issue template, ADR template, architecture review template.
* `templates/quality/`: ESLint, Prettier, EditorConfig, commitlint, CI validation.

### Etapa 7 — Casos de referência
* `references/cases/*.md`: cenários reais ou simulados.
* `references/examples/*.json`: entrada estruturada + saída esperada.
* `references/decision-benchmarks.md`: comparação entre arquiteturas para cenários comuns.
* `references/migrations.md`: quando migrar de monólito para modular, de sync para async, de SQL puro para cache + fila.

### Etapa 8 — ADRs da própria engine
* `docs/adr/0001-adopt-decision-schema.md`
* `docs/adr/0002-adopt-scoring-engine.md`
* `docs/adr/0003-prioritize-modular-monolith-as-default.md`
* `docs/adr/0004-use-c4-for-output-views.md`
* `docs/adr/0005-team-topologies-affects-boundaries.md`

### Etapa 9 — Saídas explicáveis
* `output/contracts/recommendation.schema.json`
* `output/contracts/decision-report.schema.json`
* `output/contracts/risk-report.schema.json`
* `output/templates/architecture-summary.md`
* `output/templates/tradeoff-matrix.md`
* `output/templates/c4-suggestion.md`
* `output/templates/adr-draft.md`

### Etapa 10 — Observabilidade da decisão
* `metrics/decision-feedback.md`
* `metrics/acceptance-rate.json`
* `metrics/override-reasons.md`
* `metrics/false-positive-patterns.md`
* `metrics/missing-context-signals.md`
* `metrics/review-checklist.md`

### Etapa 11 — Testes da engine
* `tests/fixtures/*.json`: entradas conhecidas.
* `tests/expected/*.json`: saídas esperadas.
* `tests/rules/*.spec.ts`: testes de regras individuais.
* `tests/scenarios/*.spec.ts`: testes ponta a ponta.
* `tests/golden-cases/`: snapshots das decisões mais importantes.

### Etapa 12 — Governança de atualização
* `CONTRIBUTING.md` com fluxo para adicionar novos padrões, regras e metodologias.
* `ARCHITECTURE.md` explicando como a engine é organizada e onde vive cada tipo de conhecimento.
* `REVIEW-CHECKLIST.md` para revisar novas decisões.
* `OWNERS.md` ou `CODEOWNERS` para definir responsáveis por áreas da base.
* `CHANGELOG.md` das mudanças relevantes na lógica de recomendação.
