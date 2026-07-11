# dotarchitecture

`dotarchitecture` is an open-source architectural evaluation tool designed to complement the `dotstack` ecosystem. It reads a project's context, parameters, and technology stacks to recommend high-level architectures, directory structures, design patterns, and generate Architecture Decision Records (ADRs) and context files for developers and AI agents.

This repository holds the design specification, architecture documentation, and initial roadmap for `dotarchitecture`.

## Documentation Indexes

Detailed specifications can be found in the following documents:

1. **[Product Requirements Document (PRD)](file:///c:/Users/adm/Desktop/dotarchiteture/docs/prd.md)**: Product goals, CLI input schemas, decision matrices, architectural hooks, and V1 MVP scope.
2. **[Internal Architecture Proposal](file:///c:/Users/adm/Desktop/dotarchiteture/docs/architecture_proposal.md)**: Details on Ports & Adapters (Hexagonal Architecture) design, layer responsibilities, execution flows, and extensibility options.
3. **[V1 MVP Issue Backlog](file:///c:/Users/adm/Desktop/dotarchiteture/docs/backlog.md)**: Milestone roadmap and issue-by-issue breakdown to guide coding.

## Core Features

- **Decentralized Decision Engine**: Suggests monolith, modular monolith, microservices, event-driven, or serverless models based on team size, domain complexity, scale, and maturity constraints.
- **Stand-alone or Integrated**: Works directly with a standalone `dotarchitecture-input.yaml` file, or reads `dotstack.yaml` properties out of the box if they exist.
- **AI Agent-Friendly Context**: Compiles ADRs to Markdown and produces machine-readable files under `.context/dotarchitecture/` so code agents can respect architectural boundaries.
- **Hook-Based Extensibility**: Exposes lifecycle hook events (such as `onNewModuleDesigned` and `onArchitectureChange`) to connect validation scripts or MCP server handlers.

## License

This project is licensed under the MIT License.
