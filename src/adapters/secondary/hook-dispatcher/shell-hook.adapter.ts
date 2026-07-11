import { HookDispatcherPort } from '../../../application/ports/hook-dispatcher.port';
import { ArchitectureDecision } from '../../../domain/models/architecture-decision.entity';
import { exec } from 'child_process';
import * as path from 'path';

export interface DotArchitecturePlugin {
  execute(
    eventName: string,
    decision: ArchitectureDecision,
    context?: any
  ): Promise<void>;
}

export class ShellHookAdapter implements HookDispatcherPort {
  private plugins: DotArchitecturePlugin[] = [];

  constructor(private hooksConfig: Record<string, string> = {}) {}

  private executeShell(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Shell hook execution failed: ${stderr || error.message}`));
          return;
        }
        resolve(stdout);
      });
    });
  }

  public async registerPlugins(pluginPaths: string[]): Promise<void> {
    for (const pluginPath of pluginPaths) {
      try {
        const absolutePath = path.isAbsolute(pluginPath)
          ? pluginPath
          : path.resolve(process.cwd(), pluginPath);

        // Dynamically load the plugin module
        const module = require(absolutePath);
        
        // Support both default exports and direct exports
        const PluginClass = module.default || module;
        const pluginInstance = new PluginClass();

        if (typeof pluginInstance.execute === 'function') {
          this.plugins.push(pluginInstance);
        }
      } catch (err) {
        console.warn(`[Warning] Failed to load plugin at '${pluginPath}': ${(err as Error).message}`);
      }
    }
  }

  public async dispatch(
    eventName: 'onNewModuleDesigned' | 'onArchitectureChange' | 'onADRAdded',
    decision: ArchitectureDecision,
    context?: any
  ): Promise<void> {
    // 1. Run shell commands configured for this event
    const command = this.hooksConfig[eventName];
    if (command) {
      try {
        await this.executeShell(command);
      } catch (err) {
        console.error(`[Error] Hook '${eventName}' shell command failed: ${(err as Error).message}`);
      }
    }

    // 2. Trigger dynamic JS/TS plugins
    for (const plugin of this.plugins) {
      try {
        await plugin.execute(eventName, decision, context);
      } catch (err) {
        console.error(`[Error] Plugin hook '${eventName}' failed: ${(err as Error).message}`);
      }
    }
  }
}
