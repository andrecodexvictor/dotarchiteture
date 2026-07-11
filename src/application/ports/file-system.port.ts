import { ProjectContext } from '../../domain/models/project-context.entity';
import { ArchitectureDecision } from '../../domain/models/architecture-decision.entity';

export interface FileSystemPort {
  readProjectContext(filePath: string): Promise<ProjectContext>;
  writeDecision(decision: ArchitectureDecision, outputPath: string): Promise<void>;
  writeADRs(decision: ArchitectureDecision, templatesDir?: string): Promise<string[]>;
  writeFolderProposal(decision: ArchitectureDecision): Promise<void>;
  writeAgentContext(decision: ArchitectureDecision, isDotContextPresent: boolean): Promise<void>;
  scanFiles(): Promise<string[]>;
  readFileImports(filePath: string): Promise<string[]>;
  readFileContent(filePath: string): Promise<string>;
  isDotContextDirectoryPresent(): Promise<boolean>;
  writeDefaultConfig(outputPath: string): Promise<void>;
  createDirectory(dirPath: string): Promise<void>;
}
