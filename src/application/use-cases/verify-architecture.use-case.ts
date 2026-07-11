import { FileSystemPort } from '../ports/file-system.port';
import { VerificationEngine, Violation } from '../../domain/services/verification-engine.service';

export interface VerifyArchitectureOutput {
  compliant: boolean;
  violations: Violation[];
  patternUsed: string;
  fixedFolders?: string[];
}

export class VerifyArchitectureUseCase {
  constructor(private fileSystemPort: FileSystemPort) {}

  public async execute(decisionFilePath: string = 'dotarchitecture.yaml', autofix: boolean = false): Promise<VerifyArchitectureOutput> {
    // 1. Scan files
    const files = await this.fileSystemPort.scanFiles();

    // 2. Read decided pattern from dotarchitecture.yaml
    let patternUsed: 'mvc' | 'layered' | 'hexagonal' | 'clean' = 'layered';
    try {
      const decisionContent = await this.fileSystemPort.scanFiles().then(async fsFiles => {
        const found = fsFiles.find(f => f.endsWith(decisionFilePath));
        if (found) {
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

    const fixedFolders: string[] = [];

    // Autofix missing folder scaffolding
    if (autofix) {
      if (patternUsed === 'hexagonal' || patternUsed === 'clean') {
        const targetFolders = [
          'src/domain/models',
          'src/domain/services',
          'src/application/use-cases',
          'src/application/ports',
          'src/adapters/primary',
          'src/adapters/secondary'
        ];
        for (const dir of targetFolders) {
          await this.fileSystemPort.createDirectory(dir);
          fixedFolders.push(dir);
        }
      } else if (patternUsed === 'layered') {
        const targetFolders = [
          'src/presentation',
          'src/application',
          'src/domain',
          'src/infrastructure'
        ];
        for (const dir of targetFolders) {
          await this.fileSystemPort.createDirectory(dir);
          fixedFolders.push(dir);
        }
      } else if (patternUsed === 'mvc') {
        const targetFolders = [
          'src/controllers',
          'src/models',
          'src/views'
        ];
        for (const dir of targetFolders) {
          await this.fileSystemPort.createDirectory(dir);
          fixedFolders.push(dir);
        }
      }
    }

    // 3. Scan dependencies
    const fileDependencies: Record<string, string[]> = {};
    for (const file of files) {
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
      patternUsed,
      fixedFolders: fixedFolders.length > 0 ? fixedFolders : undefined
    };
  }
}
