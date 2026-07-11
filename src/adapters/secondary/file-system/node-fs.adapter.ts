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
    // 1. Write to .architecture/ (Created regardless!)
    const archDir = this.getAbsolutePath('.architecture');
    await this.ensureDir(archDir);

    const serializedDecision = yaml.stringify({
      recommendedArchitecture: decision.recommendedArchitecture,
      recommendedInternalPattern: decision.recommendedInternalPattern,
      warnings: decision.warnings,
      observability: decision.observabilityDeployGuidelines
    });

    const readmeContent = `# Architecture Guide for AI Agents

This directory contains architectural decisions and constraints for this repository.

## Decisions Record
* **System Model**: ${decision.recommendedArchitecture}
* **Internal Pattern**: ${decision.recommendedInternalPattern}

## Guidelines & Rules for Coding
1. **Directory Rules**: Respect the structure defined in [folder-structure.md](../docs/adr/folder-structure.md). Do not bypass modules.
2. **Dependency Rules**:
   - Clean architecture flows inwards.
   - Core domain must not import external routers, databases, or frameworks.
3. **Execution Verification**:
   - Run \`dotarchitecture verify\` to check for import and directory violations before submitting PRs.

## Current Warnings
${decision.warnings.length > 0 ? decision.warnings.map(w => `* ${w}`).join('\n') : '* No active alerts.'}
`;

    await fs.writeFile(path.join(archDir, 'architecture.yaml'), serializedDecision, 'utf-8');
    await fs.writeFile(path.join(archDir, 'README.md'), readmeContent, 'utf-8');

    // 2. Mirror to .context/dotarchitecture/ if dotcontext is present
    if (isDotContextPresent) {
      const contextDir = this.getAbsolutePath('.context/dotarchitecture');
      await this.ensureDir(contextDir);
      await fs.writeFile(path.join(contextDir, 'architecture.yaml'), serializedDecision, 'utf-8');
      await fs.writeFile(path.join(contextDir, 'README.md'), readmeContent, 'utf-8');
    }
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
}
