import { FileSystemPort } from '../../../application/ports/file-system.port';
import { ProjectContext } from '../../../domain/models/project-context.entity';
import { ArchitectureDecision } from '../../../domain/models/architecture-decision.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

export class NodeFSAdapter implements FileSystemPort {
  constructor(private baseDir: string = process.cwd()) {}

  private getAbsolutePath(relativePath: string): string {
    return path.isAbsolute(relativePath) ? relativePath : path.resolve(this.baseDir, relativePath);
  }

  private async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  public async readProjectContext(filePath: string): Promise<ProjectContext> {
    const absolutePath = this.getAbsolutePath(filePath);
    let rawContent = '';

    try {
      rawContent = await fs.readFile(absolutePath, 'utf-8');
    } catch (err) {
      // Fallback strategies
      if (filePath === 'dotstack.yaml') {
        try {
          const fallbackPath = this.getAbsolutePath('dotarchitecture-input.yaml');
          rawContent = await fs.readFile(fallbackPath, 'utf-8');
        } catch {
          throw new Error(`Could not load configuration file. Tried '${filePath}' and 'dotarchitecture-input.yaml'. Please run 'dotarchitecture init' to generate a template.`);
        }
      } else {
        throw new Error(`Could not read configuration file at ${filePath}: ${(err as Error).message}`);
      }
    }

    const parsed = yaml.parse(rawContent);
    if (!parsed) {
      throw new Error(`Invalid YAML format in config file: ${filePath}`);
    }

    // 1. Check if it is a dotstack.yaml file
    if (parsed.stack || parsed.team || parsed.features) {
      return {
        teamSize: parsed.team?.developers ?? 5,
        teamMaturity: parsed.team?.maturity ?? 'intermediate',
        domainComplexity: parsed.features?.complexity ?? 'medium',
        scale: parsed.features?.scale ?? 'low',
        availability: parsed.features?.availability ?? 'low',
        auditability: parsed.features?.auditability ?? false,
        targetStack: `${parsed.stack?.language ?? 'typescript'}/${parsed.stack?.framework ?? 'nestjs'}`,
        ...parsed // Preserve raw rules/overrides if declared in dotstack.yaml
      } as unknown as ProjectContext;
    }

    // 2. Check if it is a dotarchitecture-input.yaml
    if (parsed.context) {
      return {
        teamSize: parsed.context.teamSize ?? 5,
        teamMaturity: parsed.context.teamMaturity ?? 'intermediate',
        domainComplexity: parsed.context.domainComplexity ?? 'medium',
        scale: parsed.context.scale ?? 'low',
        availability: parsed.context.availability ?? 'low',
        auditability: parsed.context.auditability ?? false,
        targetStack: parsed.project?.targetStack ?? 'typescript/nestjs',
        ...parsed // Preserve raw rules/overrides
      } as unknown as ProjectContext;
    }

    // 3. Simple flat mapping fallback
    return {
      teamSize: parsed.teamSize ?? 5,
      teamMaturity: parsed.teamMaturity ?? 'intermediate',
      domainComplexity: parsed.domainComplexity ?? 'medium',
      scale: parsed.scale ?? 'low',
      availability: parsed.availability ?? 'low',
      auditability: parsed.auditability ?? false,
      targetStack: parsed.targetStack ?? 'typescript/nestjs',
      ...parsed
    };
  }

  public async writeDecision(decision: ArchitectureDecision, outputPath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(outputPath);
    await this.ensureDir(path.dirname(absolutePath));
    const serialized = yaml.stringify(decision);
    await fs.writeFile(absolutePath, serialized, 'utf-8');
  }

  public async writeADRs(decision: ArchitectureDecision, templatesDir?: string): Promise<string[]> {
    const adrDir = this.getAbsolutePath('docs/adr');
    await this.ensureDir(adrDir);

    const generatedPaths: string[] = [];
    const dateStr = new Date().toISOString().split('T')[0];

    const defaultTemplates = {
      '001-base-architecture.md': `# ADR-001: Base System Architecture

## Context and Problem Statement
We need to define a consistent, scalable architectural style for this project that matches our team size, development speed, and domain complexity.

## Decision Outcome
* Chosen High-Level Architecture: **{{RECOMMENDED_ARCHITECTURE}}**
* Chosen Internal Design Pattern: **{{RECOMMENDED_INTERNAL_PATTERN}}**

### Rationale
* The selected architecture matches our constraints.
* Alternative high-level options were rejected to avoid over-engineering or integration overhead.

## Rejected Options and Trade-offs
{{REJECTED_OPTIONS}}

## Warnings & Risks
{{WARNINGS}}

## Status
Approved

## Date
{{DATE}}
`,
      '002-testing-strategy.md': `# ADR-002: Development Style and Testing Strategy

## Context and Problem Statement
We need to establish clear testing guidelines and engineering processes to ensure codebase reliability and speed up onboarding.

## Decision Outcome
* Recommended Development Styles:
{{DEV_STYLE}}

* Observability and Deployment Guidelines:
{{OBSERVABILITY}}

## Status
Approved

## Date
{{DATE}}
`
    };

    const templateFiles = Object.keys(defaultTemplates) as Array<keyof typeof defaultTemplates>;

    for (const fileName of templateFiles) {
      let templateContent = defaultTemplates[fileName];

      if (templatesDir) {
        const customTemplatePath = path.join(this.getAbsolutePath(templatesDir), fileName);
        try {
          templateContent = await fs.readFile(customTemplatePath, 'utf-8');
        } catch {
          // Fall back to default template silently
        }
      }

      // Populate placeholders
      const rejectedStr = decision.rejectedArchitectures
        .map(r => `* **${r.architecture}**: ${r.reason}`)
        .join('\n');
      const warningsStr = decision.warnings.length > 0 
        ? decision.warnings.map(w => `> [!WARNING]\n> ${w}`).join('\n') 
        : '* No immediate over-engineering warnings detected.';
      const devStyleStr = decision.recommendedDevStyle.map(d => `* ${d}`).join('\n');
      const observabilityStr = decision.observabilityDeployGuidelines.map(o => `* ${o}`).join('\n');

      const compiled = templateContent
        .replace(/{{RECOMMENDED_ARCHITECTURE}}/g, decision.recommendedArchitecture)
        .replace(/{{RECOMMENDED_INTERNAL_PATTERN}}/g, decision.recommendedInternalPattern)
        .replace(/{{REJECTED_OPTIONS}}/g, rejectedStr)
        .replace(/{{WARNINGS}}/g, warningsStr)
        .replace(/{{DEV_STYLE}}/g, devStyleStr)
        .replace(/{{OBSERVABILITY}}/g, observabilityStr)
        .replace(/{{DATE}}/g, dateStr);

      const outputPath = path.join(adrDir, fileName);
      await fs.writeFile(outputPath, compiled, 'utf-8');
      generatedPaths.push(outputPath);
    }

    return generatedPaths;
  }

  public async writeFolderProposal(decision: ArchitectureDecision): Promise<void> {
    const adrDir = this.getAbsolutePath('docs/adr');
    await this.ensureDir(adrDir);

    let treeStructure = '';
    if (decision.recommendedInternalPattern === 'hexagonal' || decision.recommendedInternalPattern === 'clean') {
      treeStructure = `
src/
├── domain/                # Core business logic (entities, value objects, domain services)
│   └── models/
├── application/           # Orchestration layer (use cases, business rules, ports)
│   ├── use-cases/
│   └── ports/             # Interfaces for driven/outgoing adapters
└── adapters/              # External interfaces (CLI, web controllers, databases)
    ├── primary/           # Driving adapters (incoming APIs, web routers)
    └── secondary/         # Driven adapters (outgoing database modules, external clients)
`;
    } else if (decision.recommendedInternalPattern === 'mvc') {
      treeStructure = `
src/
├── controllers/           # HTTP controllers routing web requests
├── models/                # Database models and domain validations
└── views/                 # View engines/frontend templates (if serving HTML)
`;
    } else {
      // Layered
      treeStructure = `
src/
├── presentation/          # Controllers, CLI handlers, API endpoints
├── domain/                # Business services, validation and models
└── infrastructure/        # Database repositories, HTTP clients, caches
`;
    }

    const content = `# Proposed Folder Structure

This project is configured to use the **${decision.recommendedInternalPattern}** architectural pattern. Agents and developers should organize newly created modules according to the layout below:

\`\`\`text
${treeStructure.trim()}
\`\`\`

## Compliance Rules
1. Domain files must **never** import files from outer layers (adapters/presentation/infrastructure).
2. All interface definitions for outgoing dependencies (e.g. database gateways, email servers) must be declared in the inner layers and implemented in outer layers.
`;

    await fs.writeFile(path.join(adrDir, 'folder-structure.md'), content, 'utf-8');
  }

  public async writeAgentContext(decision: ArchitectureDecision, isDotContextPresent: boolean): Promise<void> {
    const archDir = this.getAbsolutePath('.architecture');
    await this.writeAgentContextDir(archDir, decision);

    if (isDotContextPresent) {
      const contextDir = this.getAbsolutePath('.context/dotarchitecture');
      await this.writeAgentContextDir(contextDir, decision);
    }
  }

  private async writeAgentContextDir(targetDir: string, decision: ArchitectureDecision): Promise<void> {
    await this.ensureDir(targetDir);
    await this.ensureDir(path.join(targetDir, 'docs'));
    await this.ensureDir(path.join(targetDir, 'agents'));
    await this.ensureDir(path.join(targetDir, 'skills'));

    const dateStr = new Date().toISOString().split('T')[0];

    // 1. architecture.yaml
    const serializedDecision = yaml.stringify({
      recommendedArchitecture: decision.recommendedArchitecture,
      recommendedInternalPattern: decision.recommendedInternalPattern,
      warnings: decision.warnings,
      observability: decision.observabilityDeployGuidelines,
      generatedAt: dateStr
    });
    await fs.writeFile(path.join(targetDir, 'architecture.yaml'), serializedDecision, 'utf-8');

    // 2. README.md (Index)
    const readmeContent = `# Architectural Context & Guides

Welcome to the project architectural knowledge base. This documentation is optimized for both human developers and AI coding agents using MCP tools.

## Core Guides

| Guide | File | Primary Focus |
| :--- | :--- | :--- |
| Project Overview | [project-overview.md](./docs/project-overview.md) | High-level system design model, tech stack, and rejected alternatives. |
| Development Workflow | [development-workflow.md](./docs/development-workflow.md) | Recommended coding styles, ganchos/hooks, and branch guidelines. |
| Testing Strategy | [testing-strategy.md](./docs/testing-strategy.md) | Testing requirements, APM configurations, and code verification. |
| Tooling & MCP | [tooling.md](./docs/tooling.md) | CLI commands reference and Model Context Protocol setups. |

## Agent Specs
* **Agent Playbook**: [architect-specialist.md](./agents/architect-specialist.md)
* **Agent Skill**: [verify-layout.md](./skills/verify-layout.md)
`;
    await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent, 'utf-8');

    // 3. docs/project-overview.md
    const rejectedStr = decision.rejectedArchitectures
      .map(r => `* **${r.architecture}**: ${r.reason}`)
      .join('\n');
    const warningsStr = decision.warnings.length > 0 
      ? decision.warnings.map(w => `> [!WARNING]\n> ${w}`).join('\n') 
      : '* No immediate over-engineering warnings detected.';

    const folderScaffoldsStr = decision.recommendedFolderScaffold
      .map(f => `| \`${f.path}\` | ${f.purpose} |`)
      .join('\n');
    const tailoredPatternsStr = decision.tailoredDesignPatterns.length > 0
      ? decision.tailoredDesignPatterns.map(p => `* **${p.name}**: ${p.description}`).join('\n')
      : '* No special GoF/DDD design patterns recommended for this basic scope.';

    const overviewContent = `# Project Architectural Overview

## Decision Outcome
* **Recommended System Architecture**: **${decision.recommendedArchitecture.toUpperCase()}**
* **Recommended Internal Design Pattern**: **${decision.recommendedInternalPattern.toUpperCase()}**

## Rationale / Justificativa Personalizada
${decision.customRationale}

## Target Directory Scaffolding
Here is the recommended folder map for your internal design pattern using your target stack:

| Directory Path | Purpose / Description |
| :--- | :--- |
${folderScaffoldsStr}

## Tailored Design Patterns (GoF & DDD)
Based on your team size, complexity, and availability specs, we recommend using these patterns:
${tailoredPatternsStr}

## Rejected Options & Trade-offs
${rejectedStr}

## Active Alerts / Warnings
${warningsStr}

## Date Generated
${dateStr}
`;
    await fs.writeFile(path.join(targetDir, 'docs', 'project-overview.md'), overviewContent, 'utf-8');

    // 4. docs/development-workflow.md
    const devStyleStr = decision.recommendedDevStyle.map(d => `* ${d}`).join('\n');
    const devWorkflowContent = `# Development Workflow Guidelines

This document outlines the coding workflow and development patterns recommended for this codebase.

## Recommended Engineering Styles
${devStyleStr}

## Extension Ganchos / Event Hooks
These hooks allow triggering validation scripts during key development lifecycles:
* \`onNewModuleDesigned\`: Executes when new modules are designed.
* \`onArchitectureChange\`: Executes when architecture files change.
* \`onADRAdded\`: Executes when a new ADR is compiled.
`;
    await fs.writeFile(path.join(targetDir, 'docs', 'development-workflow.md'), devWorkflowContent, 'utf-8');

    // 5. docs/testing-strategy.md
    const observabilityStr = decision.observabilityDeployGuidelines.map(o => `* ${o}`).join('\n');
    const testingStrategyContent = `# Testing Strategy & Observability

Guidelines for verifying execution and monitoring service deployments.

## Testing Guidelines
* Run unit and integration tests before pushing changes.
* Maintain clean layer isolation: mock external adapters when testing application use cases.

## Observability & Deploy
${observabilityStr}
`;
    await fs.writeFile(path.join(targetDir, 'docs', 'testing-strategy.md'), testingStrategyContent, 'utf-8');

    // 6. docs/tooling.md
    const toolingContent = `# CLI & MCP Tooling Reference

Reference for managing and verifying the architectural layout.

## CLI Command Map
* \`dotarchitecture init\`: Generates template input configs.
* \`dotarchitecture design\`: Runs evaluations and builds docs/ADRs.
* \`dotarchitecture verify\`: Scans codebase files and imports to check constraints.
* \`dotarchitecture mcp\`: Launches the Model Context Protocol stdio server.

## Model Context Protocol (MCP) Setup
Refer to root README.md for tool integration parameters.
`;
    await fs.writeFile(path.join(targetDir, 'docs', 'tooling.md'), toolingContent, 'utf-8');

    // 7. agents/architect-specialist.md
    const agentPlaybookContent = `# Agent Playbook: Architect Specialist

You are the Architect Specialist agent for this repository. Your mission is to maintain codebase structural integrity and prevent architectural drift.

## Core Directives
1. **Never bypass layers**:
   - In Hexagonal pattern: domain files must never import application/adapters/infrastructure.
   - In Layered pattern: domain files must never import presentation/controllers.
2. **Consult ADRs**: Before creating new folders or feature modules, read docs under \`docs/adr/\`.
3. **Verify Compliance**: Always run \`dotarchitecture verify\` (or \`run_verify_checks\` tool) before committing code changes or completing task contracts.
`;
    await fs.writeFile(path.join(targetDir, 'agents', 'architect-specialist.md'), agentPlaybookContent, 'utf-8');

    // 8. skills/verify-layout.md
    const skillContent = `# Agent Skill: Verify Layout Compliance

This skill enables agents to verify directory structure and import links.

## Usage Instructions
1. Run the \`dotarchitecture verify\` shell command (or invoke the \`run_verify_checks\` tool).
2. Read the output.
3. If violations are found, fix the file imports or delete unexpected folders before proceeding to the validation stage.
`;
    await fs.writeFile(path.join(targetDir, 'skills', 'verify-layout.md'), skillContent, 'utf-8');
  }

  public async scanFiles(): Promise<string[]> {
    const files: string[] = [];

    const walk = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(this.baseDir, fullPath);

        // Ignore common directories
        if (
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === '.git' ||
          entry.name === '.architecture' ||
          entry.name === '.context' ||
          entry.name === 'docs'
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          files.push(relPath);
        }
      }
    };

    try {
      await walk(this.baseDir);
    } catch {
      // Return empty array if walking fails (e.g. empty repository)
    }

    return files;
  }

  public async readFileImports(filePath: string): Promise<string[]> {
    const absolutePath = this.getAbsolutePath(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const imports: string[] = [];

    // Parse JS/TS imports: import ... from '...' or require('...')
    const tsImportRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
    const tsRequireRegex = /require\(['"](.*)['"]\)/g;
    // Parse Go imports: import "..."
    const goImportRegex = /import\s+['"](.*)['"]/g;

    let match;
    while ((match = tsImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    while ((match = tsRequireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    while ((match = goImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  public async readFileContent(filePath: string): Promise<string> {
    const absolutePath = this.getAbsolutePath(filePath);
    return await fs.readFile(absolutePath, 'utf-8');
  }

  public async isDotContextDirectoryPresent(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.getAbsolutePath('.context'));
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  public async writeDefaultConfig(outputPath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(outputPath);
    const content = `# dotarchitecture configuration file
project:
  name: "unnamed-project"
  targetStack: "typescript/nestjs"

context:
  teamSize: 5
  teamMaturity: "intermediate" # junior, intermediate, advanced
  domainComplexity: "medium"   # low, medium, high
  scale: "low"                 # low, medium, high
  availability: "low"          # low, medium, high
  auditability: false

overrides:
  # Force specific outputs if desired
  # architecture: "modular-monolith"
  # pattern: "hexagonal"

rules:
  # Override default evaluation thresholds
  minTeamSizeForMicroservices: 15
  minScaleForEventDriven: "high"
  maxMaturityForActiveRecord: "junior"

templatesDir: "./custom-templates"

hooks:
  onArchitectureChange: "echo 'Architecture changed!'"
  onNewModuleDesigned: "echo 'New module designed!'"
  plugins: []
`;
    await this.ensureDir(path.dirname(absolutePath));
    await fs.writeFile(absolutePath, content, 'utf-8');
  }

  public async createDirectory(dirPath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(dirPath);
    await this.ensureDir(absolutePath);
  }
}
