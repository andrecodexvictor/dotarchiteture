import { VerificationEngine } from '../../src/domain/services/verification-engine.service';

describe('VerificationEngine', () => {
  test('should pass for clean hexagonal structure', () => {
    const files = [
      'src/domain/models/user.ts',
      'src/application/use-cases/create-user.ts',
      'src/adapters/primary/cli/index.ts',
      'src/adapters/secondary/database/pg.adapter.ts'
    ];
    const fileDependencies = {
      'src/domain/models/user.ts': [],
      'src/application/use-cases/create-user.ts': ['src/domain/models/user.ts'],
      'src/adapters/primary/cli/index.ts': ['src/application/use-cases/create-user.ts'],
      'src/adapters/secondary/database/pg.adapter.ts': ['src/domain/models/user.ts']
    };

    const violations = VerificationEngine.verify('hexagonal', files, fileDependencies);
    expect(violations).toHaveLength(0);
  });

  test('should detect directory violations when MVC folders are present in hexagonal structure', () => {
    const files = [
      'src/domain/models/user.ts',
      'src/controllers/user.controller.ts',
      'src/views/index.html'
    ];
    const violations = VerificationEngine.verify('hexagonal', files, {});
    expect(violations.some(v => v.type === 'directory')).toBe(true);
  });

  test('should detect dependency violations when domain imports application or adapters', () => {
    const files = [
      'src/domain/models/user.ts',
      'src/adapters/secondary/database/pg.ts'
    ];
    const fileDependencies = {
      'src/domain/models/user.ts': ['src/adapters/secondary/database/pg.ts'], // Domain imports db adapter!
      'src/adapters/secondary/database/pg.ts': []
    };

    const violations = VerificationEngine.verify('hexagonal', files, fileDependencies);
    expect(violations.some(v => v.type === 'dependency')).toBe(true);
  });

  test('should detect directory violations when ports/adapters folder exists in MVC structure', () => {
    const files = [
      'src/controllers/user.ts',
      'src/models/user.ts',
      'src/ports/db-port.ts' // Ports folder in MVC!
    ];
    const violations = VerificationEngine.verify('mvc', files, {});
    expect(violations.some(v => v.type === 'directory')).toBe(true);
  });
});
