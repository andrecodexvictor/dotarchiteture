export interface Violation {
  type: 'directory' | 'dependency';
  fileOrDirectory: string;
  message: string;
}

export class VerificationEngine {
  public static verify(
    pattern: 'mvc' | 'layered' | 'hexagonal' | 'clean',
    files: string[],
    fileDependencies: Record<string, string[]>
  ): Violation[] {
    const violations: Violation[] = [];

    // Normalise paths to use forward slashes for cross-platform matching
    const normalizedFiles = files.map(f => f.replace(/\\/g, '/'));
    const normalizedDependencies: Record<string, string[]> = {};
    for (const [file, deps] of Object.entries(fileDependencies)) {
      normalizedDependencies[file.replace(/\\/g, '/')] = deps.map(d => d.replace(/\\/g, '/'));
    }

    if (pattern === 'hexagonal' || pattern === 'clean') {
      // 1. Directory Structure Checks
      const hasRootMVCDirs = normalizedFiles.some(
        f => f.includes('/controllers/') || f.includes('/views/') || (f.includes('/models/') && !f.includes('/domain/') && !f.includes('/application/'))
      );
      if (hasRootMVCDirs) {
        violations.push({
          type: 'directory',
          fileOrDirectory: 'controllers/views/models',
          message: 'MVC folders (controllers, views, models) found in root or source folder. Hexagonal architecture recommends grouping external systems under "adapters" and application logic under "application"/"domain".'
        });
      }

      // 2. Dependency Rule Checks (Inner layers must not import outer layers)
      for (const [file, deps] of Object.entries(normalizedDependencies)) {
        const isDomain = file.includes('/domain/');
        const isApplication = file.includes('/application/');

        for (const dep of deps) {
          if (isDomain) {
            // Domain can only import other domain files or standard libraries
            if (dep.includes('/adapters/') || dep.includes('/infrastructure/') || dep.includes('/application/')) {
              violations.push({
                type: 'dependency',
                fileOrDirectory: file,
                message: `Domain file '${file}' imports outer layer dependencies from '${dep}'. The domain core must remain clean and independent of application use cases and adapters.`
              });
            }
          } else if (isApplication) {
            // Application can import domain, but cannot import adapters/infrastructure details directly
            if (dep.includes('/adapters/') || dep.includes('/infrastructure/')) {
              violations.push({
                type: 'dependency',
                fileOrDirectory: file,
                message: `Application use-case/port '${file}' imports adapter/infrastructure details from '${dep}'. Adapters must implement application ports; application code must not depend on concrete adapters.`
              });
            }
          }
        }
      }
    }

    if (pattern === 'layered') {
      // 1. Dependency checks: lower layers cannot import higher layers
      for (const [file, deps] of Object.entries(normalizedDependencies)) {
        const isDomain = file.includes('/domain/') || file.includes('/services/');
        const isInfrastructure = file.includes('/infrastructure/') || file.includes('/persistence/');

        for (const dep of deps) {
          if (isDomain) {
            if (dep.includes('/presentation/') || dep.includes('/controllers/') || dep.includes('/ui/')) {
              violations.push({
                type: 'dependency',
                fileOrDirectory: file,
                message: `Domain file '${file}' imports presentation layer code from '${dep}'. Domain logic must not depend on presentation details.`
              });
            }
          } else if (isInfrastructure) {
            if (dep.includes('/presentation/') || dep.includes('/controllers/') || dep.includes('/ui/')) {
              violations.push({
                type: 'dependency',
                fileOrDirectory: file,
                message: `Infrastructure file '${file}' imports presentation layer code from '${dep}'. Persistence/Infrastructure must be independent of presentation.`
              });
            }
          }
        }
      }
    }

    if (pattern === 'mvc') {
      // MVC Checks: controllers shouldn't have too complex adapters setup
      const hasPortsOrAdapters = normalizedFiles.some(f => f.includes('/ports/') || f.includes('/adapters/'));
      if (hasPortsOrAdapters) {
        violations.push({
          type: 'directory',
          fileOrDirectory: 'ports/adapters',
          message: 'Complex layering folders ("ports" or "adapters") found in an MVC structure. Keep the codebase simple using controllers/models or upgrade to Hexagonal architecture if domain complexity has increased.'
        });
      }
    }

    return violations;
  }
}
