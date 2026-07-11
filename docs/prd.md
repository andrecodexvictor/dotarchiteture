# Product Requirements Document (PRD) - dotarchitecture

## 1. Overview & Context

`dotarchitecture` is an open-source, MIT-licensed developer toolkit and CLI designed to complement the `dotstack` and `dotcontext` ecosystems. It evaluates a project's context (e.g., team size, domain complexity, scalability needs, team maturity, and target technology stack) to recommend system architectures, internal design patterns, directory layouts, and development practices. 

Its primary purpose is to establish clear architectural boundaries early in a project's lifecycle, document decisions via Architecture Decision Records (ADRs), and expose "architectural hooks" to assist human developers and AI coding agents in maintaining alignment as the project evolves.

### Design Principles
1. **English-First**: All generated code, YAML specs, ADRs, documentation, and agent-facing contexts are in English to ensure global compatibility.
2. **Standalone Usage**: Operates fully independently of `dotstack`. It reads its own input configuration file or flags.
3. **Optional Synergy with `dotstack`**: If a `dotstack.yaml` file exists, `dotarchitecture` automatically reads it to pre-populate inputs (e.g., team configuration, stack, project scope) and degrades gracefully if it is absent.
4. **Integration with `vinilana/dotcontext`**: Generates an `.architecture/` folder regardless to store decisions and guides. If `.context/` is present, it also mirrors the files into `./.context/dotarchitecture/` to serve as a native source for `dotcontext` harnesses.
5. **Loose Coupling**: Interacts with other tools purely through standard file formats (YAML/JSON), CLI arguments, and directory structures.
6. **Agent-Friendly**: Includes a built-in Model Context Protocol (MCP) server mode to allow AI agents to dynamically query project architecture rules and decisions directly, without spawning raw terminal commands.

---

## 2. Core Features & Scope (V1 MVP)

### 2.1 CLI & Interface Modes
The CLI will expose four primary operations:
1. `dotarchitecture init`
   - **Behavior**: Generates a default, commented template configuration file (`dotarchitecture-input.yaml`) in the current working directory.
   - **Usage**: Allows users to quickly define their project's parameters and custom decision rules.
2. `dotarchitecture design [-f <input_file>]`
   - **Behavior**: Evaluates the input file (defaulting to `dotstack.yaml` if present, falling back to `dotarchitecture-input.yaml` or a specified file) and generates the output artifacts.
3. `dotarchitecture verify`
   - **Behavior**: Scans the codebase directory structure and dependencies to detect architectural violations (e.g. unexpected directories, illegal package-to-package imports).
4. `dotarchitecture mcp`
   - **Behavior**: Launches a Model Context Protocol (MCP) server.
   - **Usage**: Allows compliant agents (like Cursor, Claude Code, etc.) to query system architectural rules, run verification checks, and retrieve pattern details dynamically as tools.

### 2.2 Input Schema (`dotarchitecture-input.yaml`)
The schema supports direct overrides and custom rule thresholds to avoid locking teams into rigid defaults:

```yaml
project:
  name: "my-app"
  targetStack: "typescript/nestjs"

# Context inputs evaluated by the decision engine
context:
  teamSize: 8
  teamMaturity: "intermediate"
  domainComplexity: "high"
  scale: "medium"
  availability: "high"
  auditability: true

# Direct overrides to bypass the decision engine logic
overrides:
  architecture: "modular-monolith" # e.g. forces modular-monolith
  pattern: "hexagonal"             # e.g. forces hexagonal structure

# Custom thresholds to override default logic metrics
rules:
  minTeamSizeForMicroservices: 15
  minScaleForEventDriven: "high"
  maxMaturityForActiveRecord: "junior"

# Local overrides for output formats
templatesDir: "./custom-templates"

# Event Hooks configuration
hooks:
  onArchitectureChange: "npm run lint"
  onNewModuleDesigned: "node scripts/notify.js"
  plugins:
    - "./plugins/my-custom-plugin.js"
```

### 2.3 The Decision Engine & Catalog

#### Decision Matrix:
The default evaluation matrix maps parameters (adjusted by user `rules` configurations) to a target high-level architecture:

- **Monolith**: Recommended for small teams, low-to-medium complexity.
- **Modular Monolith**: Recommended for medium teams, medium-to-high complexity, intermediate-to-advanced maturity.
- **Microservices**: Only suggested for large teams (e.g., > 15), high complexity, and high scale. If forced or selected under mismatched criteria, a warning is appended to `dotarchitecture.yaml`.
- **Event-Driven**: Recommended if scalability/availability demands are high.
- **Serverless**: Recommended for variable workloads and cloud-native frameworks.

#### Dynamic Pattern Catalog:
Rather than storing a static list, `dotarchitecture` fetches pattern definitions, GoF mappings, and reference GitHub repositories (e.g., TypeScript clean architecture templates) **on-the-fly at runtime** via external APIs (such as GitHub Search API or hosted index registries).

- **Offline Fallback**: To support offline development and CI/CD pipelines, the CLI:
  1. Caches previous API queries in a local cache directory (e.g. `%APPDATA%/dotarchitecture/cache` on Windows or `~/.cache/dotarchitecture` on Linux/macOS).
  2. Falls back to a minimal built-in catalog if there is no internet connection and the cache is empty.

### 2.4 Artifact Generation (Outputs)

1. **`dotarchitecture.yaml`**: The persistent record of architectural decisions, including target configuration, chosen styles, rejected alternatives, and custom overrides.
2. **Architecture Decision Records (ADRs)**: Created under `./docs/adr/` (e.g., `001-base-architecture.md`, `002-testing-strategy.md`).
   - Uses built-in templates by default, but falls back to user templates if `templatesDir` is defined in the config.
3. **Directory Structure Guide**: A markdown file outlining the recommended tree structure for the project.
4. **Agent Context Directories**:
   - **`.architecture/`**: Created regardless to house the durable context.
     - **`architecture.yaml`**: Machine-readable format of decisions.
     - **`README.md`**: Guide for AI agents containing instructions on how to structure imports and place files.
   - **`.context/dotarchitecture/`**: Optional, mirrored copy of the `.architecture/` contents if a `.context/` directory exists in the workspace.

---

## 3. Architectural Hooks & Plugins

`dotarchitecture` supports event hooks to prevent architectural drift during agent-led or human development.

### 3.1 Hook Execution Types
1. **Shell Commands**: Simple commands executed directly in the shell (e.g. `npm run test` or notifications).
2. **JS/TS Plugin Modules**: Programmatic extensions loaded dynamically at runtime via config (e.g. custom classes executing validation code).

### 3.2 Supported Events
- `onNewModuleDesigned`: Dispatched when a module/folder structure is introduced.
- `onArchitectureChange`: Dispatched if config parameters change.
- `onADRAdded`: Dispatched when a new ADR file is compiled.

---

## 4. Acceptance Criteria (MVP)

1. Command `dotarchitecture init` creates a valid `dotarchitecture-input.yaml` template.
2. Command `dotarchitecture design` successfully parses the input context, executes overrides/custom rules, dynamically fetches catalog entries (or reads local cache), and outputs `dotarchitecture.yaml` and ADRs.
3. Command `dotarchitecture verify` validates local files and outputs a report highlighting structural violations.
4. Command `dotarchitecture mcp` launches a functional Model Context Protocol server.
5. Directory `.architecture/` is generated (along with `.context/dotarchitecture/` if `.context/` exists), housing the machine-readable summary.
6. The CLI code is covered by automated unit tests.
