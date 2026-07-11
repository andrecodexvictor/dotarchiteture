# V1 MVP Issue Backlog - dotarchitecture

This backlog is structured into sequential milestones to guide the implementation of `dotarchitecture` V1.

---

## Milestone 1: Project Scaffolding & Domain Entities

### Issue 1.1: Project Setup (TypeScript, Tooling, & MIT License)
- **Description**: Initialize the NPM package, configure TypeScript, ESLint, Prettier, Jest, and add the MIT license.
- **Tasks**:
  - Run `npm init` and create `package.json`.
  - Install dependencies: `typescript`, `jest`, `ts-jest`, `@types/jest`, `eslint`, `prettier`.
  - Configure `tsconfig.json`, `.eslintrc.json`, and `jest.config.js`.
  - Add `LICENSE` (MIT).
- **Acceptance Criteria**: Running `npm run build` and `npm run test` executes successfully.

### Issue 1.2: Define Domain Entities (`ProjectContext` and `ArchitectureDecision`)
- **Description**: Create the domain representations representing the input state (context) and the output state (architectural choices).
- **Tasks**:
  - Write `src/domain/models/project-context.entity.ts` matching inputs: team size, domain complexity, scale, availability, auditability, maturity, target stack.
  - Write `src/domain/models/architecture-decision.entity.ts` containing: chosen architecture, rejected options, selected internal patterns, suggested folder structures, observability guide.
- **Acceptance Criteria**: Code compiles cleanly under `tsc`. No external dependencies or imports in these files.

---

## Milestone 2: Customizable Decision Engine & API Pattern Catalog

### Issue 2.1: Decision Engine with Rule Thresholds & Direct Overrides
- **Description**: Implement the logic that processes `ProjectContext` against evaluation matrix rules, applying custom overrides and rule threshold values configured in the input YAML.
- **Tasks**:
  - Implement dynamic thresholds (e.g. `minTeamSizeForMicroservices` from config, defaulting to `15` if absent).
  - Implement override check: if `overrides.architecture` is defined, bypass standard calculations and force the chosen output.
  - Create warning outputs when architectures are forced that conflict with baseline thresholds.
- **Acceptance Criteria**: Unit tests check override triggers and customized thresholds, asserting correct choices.

### Issue 2.2: Dynamic Pattern API Client & Cache Manager
- **Description**: Implement catalog fetching from remote APIs and local AppData cache validation.
- **Tasks**:
  - Define `src/application/ports/pattern-catalog.port.ts`.
  - Implement `src/adapters/secondary/pattern-catalog/api-catalog.adapter.ts` to perform HTTP queries for patterns.
  - Implement `src/adapters/secondary/pattern-catalog/cache-manager.adapter.ts` to read/write JSON files in home dir cache folder.
  - Create a minimal built-in fallback dataset inside the CLI for fully offline, cache-empty environments.
- **Acceptance Criteria**: Integration test mocks HTTP requests, demonstrates that local cache is created on successful fetch, and verifies offline graceful fallback.

---

## Milestone 3: Ports, Adapters, & Custom Templates

### Issue 3.1: Define Application Ports & Interfaces
- **Description**: Create interfaces defining boundaries between core business logic and infrastructure drivers.
- **Tasks**:
  - Write `src/application/ports/file-system.port.ts` with methods for reading configs and writing outputs.
  - Write `src/application/ports/hook-dispatcher.port.ts` for lifecycle event notifications.
- **Acceptance Criteria**: Abstract ports established with no concrete details of third-party libraries.

### Issue 3.2: Implement File System Adapter & ADR Templates
- **Description**: Create the concrete adapter to load `dotstack.yaml` or `dotarchitecture-input.yaml`, and compile template ADRs.
- **Tasks**:
  - Create `src/adapters/secondary/file-system/node-fs.adapter.ts`.
  - Write template compilation logic: check if `templatesDir` contains custom templates, falling back to built-in Markdown files.
  - Write files under `./docs/adr/` and agent-specific context files under `./.context/dotarchitecture/` (aligning with `vinilana/dotcontext`).
- **Acceptance Criteria**: Running use cases produces correct directories, compiled templates, and a machine-readable summary.

---

## Milestone 4: Verification Engine (Codebase Checks)

### Issue 4.1: Verification Domain Logic
- **Description**: Write domain services to evaluate the filesystem workspace structure against requirements.
- **Tasks**:
  - Create `src/domain/services/verification-engine.service.ts`.
  - Design rules to check for unexpected folders and illegal imports (e.g. direct domain layer dependencies on adapter implementations).
- **Acceptance Criteria**: Pure service accepts a folder layout/imports map and return compliance reports containing lists of violations.

### Issue 4.2: File Scan Adapter
- **Description**: Create the adapter to scan code repositories, list directories, and parse file imports.
- **Tasks**:
  - Extend `FileSystemPort` to support workspace structural searches.
  - Write file glob and import scanners (e.g., using regular expressions to parse static `import ... from ...` lines) in `NodeFSAdapter`.
- **Acceptance Criteria**: Scanner returns directories and dependency linkages.

---

## Milestone 5: Primary Adapters: CLI & MCP Server

### Issue 5.1: CLI Interface Integration
- **Description**: Build the commands (`init`, `design`, `verify`) using commander/cac.
- **Tasks**:
  - Route user parameters and options flags to the appropriate application use cases.
  - Output pretty console error stacks and execution metrics.
- **Acceptance Criteria**: Exposing commands in npm binary allows executing `dotarchitecture init` and `dotarchitecture design` from terminal.

### Issue 5.2: Model Context Protocol (MCP) Server Mode
- **Description**: Build the `mcp` server adapter allowing agents to query dotarchitecture rules directly.
- **Tasks**:
  - Implement `@modelcontextprotocol/sdk` server inside `src/adapters/primary/mcp/`.
  - Expose tools: `get_architecture_rules`, `run_verify_checks`, `suggest_design_patterns`.
  - Integrate tools directly with `DesignArchitectureUseCase` and `VerifyArchitectureUseCase`.
- **Acceptance Criteria**: Starting `dotarchitecture mcp` launches a valid JSON-RPC stdout server that agents can query.

---

## Milestone 6: Hooks, Dynamic Plugins, & Release

### Issue 6.1: Event Hook Execution & Dynamic Plugin Importer
- **Description**: Trigger custom hooks and load third-party extensions.
- **Tasks**:
  - Implement shell command executor.
  - Implement Javascript/TypeScript dynamic file imports to load plugin modules configured in YAML.
  - Bind hook execution to design and verification use case lifecycles.
- **Acceptance Criteria**: Modifying architecture configuration triggers dynamic plugins and shell validation scripts successfully.

### Issue 6.2: End-to-End Verification & Documentation
- **Description**: Create target sample projects, verify execution, and finalize README.md guides.
- **Tasks**:
  - Build sample config scenarios representing microservices, monoliths, and modular structures.
  - Document plugin interfaces and MCP server integration configurations.
- **Acceptance Criteria**: Tool compiles and publishes locally, and all integration pathways execute without errors.
