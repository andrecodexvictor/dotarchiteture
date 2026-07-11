import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { NodeFSAdapter } from '../../secondary/file-system/node-fs.adapter';
import { ApiCatalogAdapter } from '../../secondary/pattern-catalog/api-catalog.adapter';
import { ShellHookAdapter } from '../../secondary/hook-dispatcher/shell-hook.adapter';
import { GeminiEmbeddingsAdapter } from '../../secondary/semantic-search/gemini-embeddings.adapter';
import { DesignArchitectureUseCase } from '../../../application/use-cases/design-architecture.use-case';
import { VerifyArchitectureUseCase } from '../../../application/use-cases/verify-architecture.use-case';
import { SearchCodebaseUseCase } from '../../../application/use-cases/search-codebase.use-case';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';

export const runMcpServer = async () => {
  const server = new Server(
    {
      name: 'dotarchitecture-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_architecture_rules',
          description: 'Evaluate configuration context (YAML) and return system architecture decisions, patterns, and ADR references.',
          inputSchema: {
            type: 'object',
            properties: {
              inputFile: {
                type: 'string',
                description: 'Path to configuration file (defaults to dotarchitecture-input.yaml or dotstack.yaml if present).'
              }
            }
          }
        },
        {
          name: 'run_verify_checks',
          description: 'Scan directories and import definitions in the workspace to verify layout correctness.',
          inputSchema: {
            type: 'object',
            properties: {
              decisionFile: {
                type: 'string',
                description: 'Path to the decision record YAML file (defaults to dotarchitecture.yaml).'
              }
            }
          }
        },
        {
          name: 'semantic_code_search',
          description: 'Perform semantic concept searches inside the workspace code files using local VSM matching and optional dense embeddings.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The conceptual search query or topic (e.g. database connection routing).'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (defaults to 5).'
              }
            },
            required: ['query']
          }
        }
      ]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'get_architecture_rules') {
      try {
        let inputFile = (args?.inputFile as string) || '';
        const fileSystemAdapter = new NodeFSAdapter();

        if (!inputFile) {
          try {
            await fs.access(path.resolve(process.cwd(), 'dotstack.yaml'));
            inputFile = 'dotstack.yaml';
          } catch {
            try {
              await fs.access(path.resolve(process.cwd(), 'dotarchitecture-input.yaml'));
              inputFile = 'dotarchitecture-input.yaml';
            } catch {
              throw new Error("No configuration file found. Run 'dotarchitecture init' or specify inputFile.");
            }
          }
        }

        let hooksConfig: Record<string, string> = {};
        try {
          const rawContent = await fs.readFile(path.resolve(process.cwd(), inputFile), 'utf-8');
          const parsed = yaml.parse(rawContent);
          if (parsed?.hooks) {
            hooksConfig = parsed.hooks;
          }
        } catch {
          // Ignore pre-parse errors
        }

        const patternCatalogAdapter = new ApiCatalogAdapter();
        const hookDispatcher = new ShellHookAdapter(hooksConfig);

        const designUseCase = new DesignArchitectureUseCase(
          fileSystemAdapter,
          patternCatalogAdapter,
          hookDispatcher
        );

        const decision = await designUseCase.execute({
          inputFile,
          outputFile: 'dotarchitecture.yaml'
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                message: 'Architecture generated and written successfully.',
                recommendations: {
                  recommendedArchitecture: decision.recommendedArchitecture,
                  recommendedInternalPattern: decision.recommendedInternalPattern,
                  warnings: decision.warnings,
                  devStyle: decision.recommendedDevStyle,
                  observability: decision.observabilityDeployGuidelines,
                  patterns: decision.patterns
                }
              }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error evaluating architecture rules: ${(err as Error).message}`
            }
          ]
        };
      }
    }

    if (name === 'run_verify_checks') {
      try {
        const decisionFile = (args?.decisionFile as string) || 'dotarchitecture.yaml';
        const fileSystemAdapter = new NodeFSAdapter();
        const verifyUseCase = new VerifyArchitectureUseCase(fileSystemAdapter);

        const result = await verifyUseCase.execute(decisionFile);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: result.compliant ? 'compliant' : 'non-compliant',
                patternChecked: result.patternUsed,
                violationsCount: result.violations.length,
                violations: result.violations
              }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing verification checks: ${(err as Error).message}`
            }
          ]
        };
      }
    }

    if (name === 'semantic_code_search') {
      try {
        const query = (args?.query as string) || '';
        const limit = Number(args?.limit ?? 5);

        if (!query) {
          throw new Error("Missing query parameter for semantic_code_search");
        }

        const fileSystemAdapter = new NodeFSAdapter();
        const embeddingsAdapter = new GeminiEmbeddingsAdapter();
        const searchUseCase = new SearchCodebaseUseCase(fileSystemAdapter, embeddingsAdapter);

        const results = await searchUseCase.execute(query, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                query,
                resultsCount: results.length,
                results: results.map(r => ({
                  filePath: r.filePath,
                  startLine: r.startLine,
                  endLine: r.endLine,
                  score: r.score,
                  content: r.content
                }))
              }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error executing semantic code search: ${(err as Error).message}`
            }
          ]
        };
      }
    }

    throw new Error(`Tool not found: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
};
