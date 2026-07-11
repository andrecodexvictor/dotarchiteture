import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface InstallationResult {
  success: boolean;
  filePath: string;
  message: string;
}

export class InstallMcpUseCase {
  constructor() {}

  public async execute(): Promise<InstallationResult> {
    const homedir = os.homedir();
    let settingsPath = '';

    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
      settingsPath = path.join(appData, 'Claude', 'settings.json');
    } else {
      settingsPath = path.join(homedir, '.claude', 'settings.json');
    }

    try {
      // 1. Ensure the directory exists
      await fs.mkdir(path.dirname(settingsPath), { recursive: true });

      // 2. Read or initialize settings
      let settings: any = { mcpServers: {} };
      try {
        const raw = await fs.readFile(settingsPath, 'utf-8');
        settings = JSON.parse(raw);
        if (!settings.mcpServers) {
          settings.mcpServers = {};
        }
      } catch {
        // File does not exist or is invalid, start with empty
      }

      // 3. Inject server configuration
      const mcpEnv: Record<string, string> = {};
      if (process.env.GEMINI_API_KEY) {
        mcpEnv.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      }

      settings.mcpServers['dotarchitecture'] = {
        command: 'npx',
        args: ['-y', 'dotarchitecture@latest', 'mcp'],
        env: Object.keys(mcpEnv).length > 0 ? mcpEnv : undefined
      };

      // 4. Save file
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');

      return {
        success: true,
        filePath: settingsPath,
        message: `Successfully registered MCP server in Claude's configuration file.`
      };
    } catch (err) {
      return {
        success: false,
        filePath: settingsPath,
        message: `Failed to install MCP server: ${(err as Error).message}`
      };
    }
  }
}
