import { FileSystemPort } from '../ports/file-system.port';
import { VerificationEngine, Violation } from '../../domain/services/verification-engine.service';
import * as yaml from 'yaml';

export interface VerifyArchitectureOutput {
  compliant: boolean;
  violations: Violation[];
  patternUsed: string;
}

export class VerifyArchitectureUseCase {
  constructor(private fileSystemPort: FileSystemPort) {}

  public async execute(decisionFilePath: string = 'dotarchitecture.yaml'): Promise<VerifyArchitectureOutput> {
    // 1. Scan files
    const files = await this.fileSystemPort.scanFiles();

    // 2. Read decided pattern from dotarchitecture.yaml
    let patternUsed: 'mvc' | 'layered' | 'hexagonal' | 'clean' = 'layered';
    try {
      // For simplicity, we read using the file system port.
      // Let's assume we can fetch the parsed configuration/decision file.
      // We parse the generated dotarchitecture.yaml if it exists.
      // If it doesn't exist, we fallback to default layered.
      const decisionContent = await this.fileSystemPort.scanFiles().then(async fsFiles => {
        const found = fsFiles.find(f => f.endsWith(decisionFilePath));
        if (found) {
          // Read content - we will implement readProjectContext or general YAML load in adapter
          // For simplicity we will assume fileSystemPort can parse it or we parse raw content.
          // Let's write a utility inside FileSystemPort, but we can also just parse standard file.
          // We can read context and fetch internal pattern:
          const ctx = await this.fileSystemPort.readProjectContext(decisionFilePath);
          return ctx as any;
        }
        return null;
      });

      if (decisionContent && decisionContent.recommendedInternalPattern) {
        patternUsed = decisionContent.recommendedInternalPattern;
      }
    } catch {
      // Fail silently and use default 'layered' pattern
    }

    // 3. Scan dependencies
    const fileDependencies: Record<string, string[]> = {};
    for (const file of files) {
      // Scan imports inside files (like .ts, .js, .go files)
      if (
        file.endsWith('.ts') ||
        file.endsWith('.js') ||
        file.endsWith('.go') ||
        file.endsWith('.py') ||
        file.endsWith('.java')
      ) {
        try {
          const imports = await this.fileSystemPort.readFileImports(file);
          fileDependencies[file] = imports;
        } catch {
          fileDependencies[file] = [];
        }
      }
    }

    // 4. Run verification engine
    const violations = VerificationEngine.verify(patternUsed, files, fileDependencies);

    return {
      compliant: violations.length === 0,
      violations,
      patternUsed
    };
  }
}
