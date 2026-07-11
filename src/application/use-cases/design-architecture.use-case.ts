import { FileSystemPort } from '../ports/file-system.port';
import { PatternCatalogPort } from '../ports/pattern-catalog.port';
import { HookDispatcherPort } from '../ports/hook-dispatcher.port';
import { DecisionEngine } from '../../domain/services/decision-engine.service';
import { ArchitectureDecision } from '../../domain/models/architecture-decision.entity';

export interface DesignArchitectureInput {
  inputFile: string;
  outputFile: string;
}

export class DesignArchitectureUseCase {
  constructor(
    private fileSystemPort: FileSystemPort,
    private patternCatalogPort: PatternCatalogPort,
    private hookDispatcherPort: HookDispatcherPort
  ) {}

  public async execute(input: DesignArchitectureInput): Promise<ArchitectureDecision> {
    // 1. Read input context
    const context = await this.fileSystemPort.readProjectContext(input.inputFile);
    
    // Config values are loaded dynamically from file System port as well.
    // Let's assume custom rules and overrides are read as part of config.
    // Since reading context might return raw config contents, we will parse them.
    // For simplicity, let's cast or read context and fetch extra rules/overrides
    // if the parser loads them from input YAML.
    const rawConfig = context as any; // Context and custom fields are in same file
    const customRules = rawConfig.rules || {};
    const overrides = rawConfig.overrides || {};
    const templatesDir = rawConfig.templatesDir;
    const plugins = rawConfig.hooks?.plugins || [];
    
    // Register plugins
    if (plugins.length > 0) {
      await this.hookDispatcherPort.registerPlugins(plugins);
    }

    // 2. Run pure decision engine logic
    const decision = DecisionEngine.evaluate(context, customRules, overrides);

    // 3. Fetch patterns dynamically
    try {
      const patterns = await this.patternCatalogPort.getPatternsForStack(
        context.targetStack,
        decision.recommendedInternalPattern
      );
      decision.patterns = patterns;
    } catch (err) {
      decision.warnings.push(`[Catalog Fetch Warning] Failed to fetch dynamic patterns from registry: ${(err as Error).message}`);
    }

    // 4. Write decision outputs
    await this.fileSystemPort.writeDecision(decision, input.outputFile);

    // 5. Generate ADRs
    await this.fileSystemPort.writeADRs(decision, templatesDir);

    // 6. Generate Suggested Directory Structure
    await this.fileSystemPort.writeFolderProposal(decision);

    // 7. Write AI Agent Context (.architecture/ and optional .context/dotarchitecture/)
    const isDotContextPresent = await this.fileSystemPort.isDotContextDirectoryPresent();
    await this.fileSystemPort.writeAgentContext(decision, isDotContextPresent);

    // 8. Dispatch events
    await this.hookDispatcherPort.dispatch('onArchitectureChange', decision);
    await this.hookDispatcherPort.dispatch('onADRAdded', decision);

    return decision;
  }
}
