# Proposed Folder Structure

This project is configured to use the **hexagonal** architectural pattern. Agents and developers should organize newly created modules according to the layout below:

```text
src/
├── domain/                # Core business logic (entities, value objects, domain services)
│   └── models/
├── application/           # Orchestration layer (use cases, business rules, ports)
│   ├── use-cases/
│   └── ports/             # Interfaces for driven/outgoing adapters
└── adapters/              # External interfaces (CLI, web controllers, databases)
    ├── primary/           # Driving adapters (incoming APIs, web routers)
    └── secondary/         # Driven adapters (outgoing database modules, external clients)
```

## Compliance Rules
1. Domain files must **never** import files from outer layers (adapters/presentation/infrastructure).
2. All interface definitions for outgoing dependencies (e.g. database gateways, email servers) must be declared in the inner layers and implemented in outer layers.
