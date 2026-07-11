import { FileSystemPort } from '../ports/file-system.port';

export class InitConfigUseCase {
  constructor(private fileSystemPort: FileSystemPort) {}

  public async execute(outputPath: string = 'dotarchitecture-input.yaml'): Promise<void> {
    await this.fileSystemPort.writeDefaultConfig(outputPath);
  }
}
