# System Architecture Guide & Engine Structure - dotarchitecture

Welcome to the **dotarchitecture** codebase. This repository contains the CLI tool and MCD server for system design validation, as well as the canonical architectural knowledge base used to configure it.

## Directory Layout

The project structure is organized to separate the decision engine source code from the configurable metadata (taxonomies, patterns, rules, templates, etc.):

```text
/
├── ARCHITECTURE.md          # This file, explaining repository layout & engine rules
├── CONTRIBUTING.md          # Guidelines for adding new patterns or rules
├── package.json             # Engine CLI runtime config
├── tsconfig.json            # TypeScript rules
├── src/                     # Source code (Hexagonal/Clean Architecture)
│   ├── domain/              # Pure domain entities and rules services
│   ├── application/         # Core orchestration use-cases
│   └── adapters/            # Primary (CLI, MCP) and secondary (file-system) adapters
├── taxonomy/                # Taxonomies of styles, project-types and metrics
├── patterns/                # Structured catalog of architectural and code patterns
│   ├── architectural/       # Monolith, microservices, event-driven etc.
│   ├── design/              # GoF/DDD patterns (Strategy, Mediator etc.)
│   ├── integration/         # API & message-based schemas (REST, Outbox etc.)
│   ├── frontend/            # Frontend structures (Atomic, Feature-based etc.)
│   └── data/                # Data and caching behaviors
├── anti-patterns/           # Non-recommended styles and anti-patterns
├── rules/                   # Decision rules, invariants, and scoring metrics
├── methodologies/           # Software delivery methodologies (TDD, Gitflow etc.)
├── templates/               # Runnable folder templates & project scaffolds
├── references/              # Benchmark cases and migration pathways
├── metrics/                 # Decision auditing metrics and reviews
└── tests/                   # CLI unit tests and decision engine rules spec
```

## How the Decision Engine Operates

The decision engine (`src/domain/services/decision-engine.service.ts`) matches input parameters defined in `ProjectContext` (e.g. `teamSize`, `domainComplexity`, `scale`, etc.) against thresholds and matrices specified under the `rules/` folder:

1. **Input Context**: The engine loads context from a project's `dotarchitecture-input.yaml` or `project-context/project-context.md`.
2. **Taxonomy & Rules Matching**: It checks parameters against supported styles in `taxonomy/` and applies scoring weights from `rules/scoring-matrix.yaml`.
3. **Template Scaffolding**: Based on the chosen pattern, it suggests directory formats matching structures defined under `templates/`.
4. **Active Verification**: The verification engine matches repository layout structures and source code imports against boundaries defined in `rules/invariants.yaml`.
