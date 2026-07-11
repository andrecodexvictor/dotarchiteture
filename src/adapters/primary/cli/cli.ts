import { Command } from 'commander';
import { NodeFSAdapter } from '../../secondary/file-system/node-fs.adapter';
import { ApiCatalogAdapter } from '../../secondary/pattern-catalog/api-catalog.adapter';
import { ShellHookAdapter } from '../../secondary/hook-dispatcher/shell-hook.adapter';
import { GeminiEmbeddingsAdapter } from '../../secondary/semantic-search/gemini-embeddings.adapter';
import { DesignArchitectureUseCase } from '../../../application/use-cases/design-architecture.use-case';
import { InitConfigUseCase } from '../../../application/use-cases/init-config.use-case';
import { VerifyArchitectureUseCase } from '../../../application/use-cases/verify-architecture.use-case';
import { SearchCodebaseUseCase } from '../../../application/use-cases/search-codebase.use-case';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

export const runCli = async (args: string[] = process.argv) => {
  const program = new Command();

  program
    .name('dotarchitecture')
    .description('MIT System Architecture Design and Verification Toolkit')
    .version('1.0.0');

  program
    .command('init')
    .description('Initialize a template configuration file (dotarchitecture-input.yaml)')
    .option('-o, --output <path>', 'Output configuration file path', 'dotarchitecture-input.yaml')
    .action(async (options) => {
      try {
        const fileSystemAdapter = new NodeFSAdapter();
        const initUseCase = new InitConfigUseCase(fileSystemAdapter);
        await initUseCase.execute(options.output);
        console.log(`\x1b[32m✔ Successfully created configuration template: ${options.output}\x1b[0m`);
      } catch (err) {
        console.error(`\x1b[31m✘ Failed to initialize configuration: ${(err as Error).message}\x1b[0m`);
        process.exit(1);
      }
    });

  program
    .command('design')
    .description('Evaluate project context and write architecture recommendations')
    .option('-f, --file <path>', 'Input configuration file (dotstack.yaml / dotarchitecture-input.yaml)', '')
    .option('-o, --output <path>', 'Output decision file path', 'dotarchitecture.yaml')
    .action(async (options) => {
      try {
        let inputFile = options.file;
        const fileSystemAdapter = new NodeFSAdapter();

        // Automatic discovery fallback if file not specified
        if (!inputFile) {
          try {
            await fs.access(path.resolve(process.cwd(), 'dotstack.yaml'));
            inputFile = 'dotstack.yaml';
          } catch {
            try {
              await fs.access(path.resolve(process.cwd(), 'dotarchitecture-input.yaml'));
              inputFile = 'dotarchitecture-input.yaml';
            } catch {
              throw new Error("No configuration file found. Please specify -f <file> or run 'dotarchitecture init'.");
            }
          }
        }

        // Pre-parse hooks from configuration
        let hooksConfig: Record<string, string> = {};
        try {
          const rawContent = await fs.readFile(path.resolve(process.cwd(), inputFile), 'utf-8');
          const parsed = yaml.parse(rawContent);
          if (parsed?.hooks) {
            hooksConfig = parsed.hooks;
          }
        } catch {
          // Graceful fallback
        }

        const patternCatalogAdapter = new ApiCatalogAdapter();
        const hookDispatcher = new ShellHookAdapter(hooksConfig);

        const designUseCase = new DesignArchitectureUseCase(
          fileSystemAdapter,
          patternCatalogAdapter,
          hookDispatcher
        );

        console.log(`\x1b[36mEvaluating architecture context from '${inputFile}'...\x1b[0m`);
        const decision = await designUseCase.execute({
          inputFile,
          outputFile: options.output
        });

        console.log(`\x1b[32m✔ Successfully evaluated and generated architecture decisions!\x1b[0m`);
        console.log(`\x1b[1mRecommended High-Level Model\x1b[0m: ${decision.recommendedArchitecture.toUpperCase()}`);
        console.log(`\x1b[1mRecommended Internal Pattern\x1b[0m: ${decision.recommendedInternalPattern.toUpperCase()}`);
        console.log(`Outputs created:`);
        console.log(`  - \x1b[34m${options.output}\x1b[0m`);
        console.log(`  - \x1b[34mdocs/adr/001-base-architecture.md\x1b[0m`);
        console.log(`  - \x1b[34mdocs/adr/002-testing-strategy.md\x1b[0m`);
        console.log(`  - \x1b[34mdocs/adr/folder-structure.md\x1b[0m`);
        console.log(`  - \x1b[34m.architecture/architecture.yaml\x1b[0m`);
        console.log(`  - \x1b[34m.architecture/README.md\x1b[0m`);

        if (decision.warnings.length > 0) {
          console.warn(`\n\x1b[33m⚠️  Warnings detected:\x1b[0m`);
          decision.warnings.forEach(w => console.warn(`  - ${w}`));
        }
      } catch (err) {
        console.error(`\x1b[31m✘ Architecture evaluation failed: ${(err as Error).message}\x1b[0m`);
        process.exit(1);
      }
    });

  program
    .command('verify')
    .description('Validate workspace directory structure and code imports against architecture rules')
    .option('-d, --decision <path>', 'Path to dotarchitecture.yaml decision file', 'dotarchitecture.yaml')
    .action(async (options) => {
      try {
        const fileSystemAdapter = new NodeFSAdapter();
        const verifyUseCase = new VerifyArchitectureUseCase(fileSystemAdapter);

        console.log(`\x1b[36mVerifying codebase structure against '${options.decision}'...\x1b[0m`);
        const result = await verifyUseCase.execute(options.decision);

        if (result.compliant) {
          console.log(`\x1b[32m✔ Codebase is fully compliant with the target pattern (${result.patternUsed})!\x1b[0m`);
        } else {
          console.error(`\x1b[31m✘ Architectural violations detected! (Pattern: ${result.patternUsed})\x1b[0m`);
          result.violations.forEach((v, index) => {
            const label = v.type === 'directory' ? '\x1b[33m[Directory]\x1b[0m' : '\x1b[31m[Dependency]\x1b[0m';
            console.error(`  ${index + 1}. ${label} In ${v.fileOrDirectory}: ${v.message}`);
          });
          process.exit(1);
        }
      } catch (err) {
        console.error(`\x1b[31m✘ Verification execution failed: ${(err as Error).message}\x1b[0m`);
        process.exit(1);
      }
    });

  program
    .command('search <query>')
    .description('Run semantic code search over codebase files')
    .option('-l, --limit <count>', 'Maximum number of results to display', '5')
    .action(async (query, options) => {
      try {
        const fileSystemAdapter = new NodeFSAdapter();
        const embeddingsAdapter = new GeminiEmbeddingsAdapter();
        const searchUseCase = new SearchCodebaseUseCase(fileSystemAdapter, embeddingsAdapter);

        console.log(`\x1b[36mRunning semantic search for query: "${query}"...\x1b[0m`);
        const limitVal = parseInt(options.limit, 10);
        const results = await searchUseCase.execute(query, limitVal);

        if (results.length === 0) {
          console.log(`\x1b[33mNo matching code blocks found.\x1b[0m`);
          return;
        }

        console.log(`\x1b[32m✔ Top ${results.length} semantic matches:\x1b[0m\n`);
        results.forEach((r, idx) => {
          console.log(`\x1b[1m#${idx + 1} - ${r.filePath}:${r.startLine}-${r.endLine} (Score: ${r.score.toFixed(4)})\x1b[0m`);
          console.log(`\x1b[90m--------------------------------------------------\x1b[0m`);
          const indentedContent = r.content.split('\n').map(line => '  ' + line).join('\n');
          console.log(indentedContent);
          console.log(`\x1b[90m--------------------------------------------------\x1b[0m\n`);
        });
      } catch (err) {
        console.error(`\x1b[31m✘ Search failed: ${(err as Error).message}\x1b[0m`);
        process.exit(1);
      }
    });

  await program.parseAsync(args);
};
