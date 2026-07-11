#!/usr/bin/env node
import { runCli } from './adapters/primary/cli/cli';
import { runMcpServer } from './adapters/primary/mcp/mcp-server.adapter';

const main = async () => {
  const args = process.argv.slice(2);
  
  // If run as 'dotarchitecture mcp', start the MCP server
  if (args[0] === 'mcp') {
    try {
      await runMcpServer();
    } catch (err) {
      console.error(`MCP Server execution error: ${(err as Error).message}`);
      process.exit(1);
    }
  } else {
    // Run normal CLI commands
    await runCli(process.argv);
  }
};

main();
