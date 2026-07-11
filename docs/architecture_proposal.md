# Internal Architecture Proposal - dotarchitecture

## 1. Architectural Style: Ports & Adapters (Hexagonal)

The application core is fully isolated from external I/O, CLI frameworks, dynamic API loaders, and execution runtimes. This makes it straightforward to run in standalone CLI mode, as a background verification command, or inside a Model Context Protocol (MCP) server.

```mermaid
graph TD
    %% Adapters Layer
    subgraph Primary Adapters (Incoming)
        CLI[CLI Adapter - commander/cac]
        MCPServer[MCP Server Adapter]
    end

    %% Application Layer
    subgraph Application Core
        UC1[DesignArchitectureUseCase]
        UC2[InitConfigUseCase]
        UC3[VerifyArchitectureUseCase]
        
        %% Ports
        ConfigPort[ConfigReaderPort]
        WriterPort[ArtifactWriterPort]
        HookPort[HookDispatcherPort]
        CatalogPort[PatternCatalogPort]
    end

    %% Domain Layer
    subgraph Domain Core
        Engine[DecisionEngine]
        VerifyService[VerificationEngine]
        ModelContext[ProjectContext Entity]
        ModelDecision[ArchitectureDecision Entity]
    end

    %% Secondary Adapters (Outgoing)
    subgraph Secondary Adapters (Driven)
        FSReader[FileSystem Reader - YAML/JSON]
        FSWriter[FileSystem Writer - YAML/Markdown]
        ShellHook[Shell Hook Dispatcher]
        PluginLoader[JS/TS Plugin Loader]
        APIClient[Dynamic API Catalog Client]
        CacheManager[AppData Cache Manager]
    end

    %% Dependency flows
    CLI --> UC1
    CLI --> UC2
    CLI --> UC3
    MCPServer --> UC1
    MCPServer --> UC3
    
    UC1 --> Engine
    UC1 --> ConfigPort
    UC1 --> WriterPort
    UC1 --> HookPort
    UC1 --> CatalogPort

    UC3 --> VerifyService
    UC3 --> ConfigPort
    UC3 --> WriterPort
    
    ConfigPort -.-> FSReader
    WriterPort -.-> FSWriter
    
    HookPort -.-> ShellHook
    HookPort -.-> PluginLoader
    
    CatalogPort -.-> APIClient
    CatalogPort -.-> CacheManager

    style CLI fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style MCPServer fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    style FSReader fill:#efebe9,stroke:#5d4037,stroke-width:2px
    style FSWriter fill:#efebe9,stroke:#5d4037,stroke-width:2px
    style ShellHook fill:#efebe9,stroke:#5d4037,stroke-width:2px
    style PluginLoader fill:#efebe9,stroke:#5d4037,stroke-width:2px
    style APIClient fill:#efebe9,stroke:#5d4037,stroke-width:2px
    style CacheManager fill:#efebe9,stroke:#5d4037,stroke-width:2px
    style Application Core fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Domain Core fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
```

---

## 2. Directory and Package Layout

```text
dotarchitecture/
├── docs/
│   ├── prd.md
│   └── architecture_proposal.md
├── src/
│   ├── index.ts               # Entrypoint (CLI / MCP Router)
│   ├── domain/                # Pure Core Domain
│   │   ├── models/            # Domain Entities & Value Objects
│   │   │   ├── project-context.entity.ts
│   │   │   ├── architecture-decision.entity.ts
│   │   │   └── pattern.value-object.ts
│   │   └── services/          # Pure Engines
│   │       ├── decision-engine.service.ts
│   │       └── verification-engine.service.ts
│   ├── application/           # Orchestration
│   │   ├── use-cases/
│   │   │   ├── design-architecture.use-case.ts
│   │   │   ├── init-config.use-case.ts
│   │   │   └── verify-architecture.use-case.ts
│   │   └── ports/             # Boundaries
│   │       ├── file-system.port.ts
│   │       ├── hook-dispatcher.port.ts
│   │       └── pattern-catalog.port.ts
│   └── adapters/              # Implementation details
│       ├── primary/
│       │   ├── cli/           # CLI Command Router
│       │   │   ├── init.command.ts
│       │   │   ├── design.command.ts
│       │   │   └── verify.command.ts
│       │   └── mcp/           # MCP Server Protocol Handler
│       │       └── mcp-server.adapter.ts
│       └── secondary/
│           ├── file-system/   # Node FS operations & YAML/JSON parsers
│           │   └── node-fs.adapter.ts
│           ├── hook-dispatcher/
│           │   ├── shell-hook.adapter.ts
│           │   └── plugin-loader.adapter.ts # Dynamic JS/TS imports
│           └── pattern-catalog/
│               ├── api-catalog.adapter.ts   # Dynamic fetching
│               └── cache-manager.adapter.ts # Home directory caching
└── tests/                     # Unit and Integration Tests
```

---

## 3. Dynamic Pattern Catalog Data Flow

The `PatternCatalogPort` abstracts where the pattern data comes from, hiding API requests and caches from the use case.

```
[DesignArchitectureUseCase]
            │
            │ 1. Requests patterns for stack 'go/chi'
            ▼
   [PatternCatalogPort]
            │
            │ 2. Asks CacheManager if cache exists for query
            ├─────────────────────────────────────┐
            ▼                                     ▼
   [CacheManagerAdapter]                  [APIClientAdapter]
            │                                     │
            ├─ YES: Returns cached JSON ──┐       │ (If NO/Expired)
            ▼                             │       │ 3. HTTP GET to pattern API
   [Catalog Data Resolved]                │       │ <--- Returns latest data
            ▲                             │       ▼
            └─ Writes cache update ───────┼───────┤
                                          │       │
                                          ▼       ▼
                               [Returns data to UseCase]
```

---

## 4. Extensibility & Dynamic Plugins

### 4.1 CLI Lifecycle Hooks
- When executing hooks, the `HookDispatcher` reads `hooks` from `dotarchitecture-input.yaml`.
- Shell commands run as child processes using Node `child_process.exec`.
- Plugins registered as Javascript modules are imported dynamically at runtime using:
  ```typescript
  const module = await import(pluginPath);
  const plugin = new module.default();
  await plugin.execute(eventContext);
  ```

### 4.2 Verification Engine
- The `VerificationEngine` scans directories using glob patterns.
- It parses dependency relations (e.g. reading `import` statements or package lists).
- It compares the directory tree against the rules in `dotarchitecture.yaml` and reports anomalies (such as an adapter folder importing database details directly when bypasses are prohibited).
