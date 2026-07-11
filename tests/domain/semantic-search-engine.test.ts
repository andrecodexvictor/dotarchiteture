import { SemanticSearchEngine } from '../../src/domain/services/semantic-search-engine.service';

describe('SemanticSearchEngine', () => {
  let engine: SemanticSearchEngine;

  beforeEach(() => {
    engine = new SemanticSearchEngine();
  });

  test('should tokenize camelCase, PascalCase and remove stopwords', () => {
    const tokens = engine.tokenize('class UserService extends BaseService { public createUser() {} }');
    // 'user', 'service', 'base', 'service', 'create', 'user'
    expect(tokens).toContain('user');
    expect(tokens).toContain('service');
    expect(tokens).toContain('create');
    expect(tokens).not.toContain('class');
    expect(tokens).not.toContain('public');
    expect(tokens).not.toContain('extends');
  });

  test('should chunk file content into overlapping windows', () => {
    const content = Array.from({ length: 15 }, (_, i) => `Line ${i + 1}`).join('\n');
    // Window: 5 lines, overlap: 2 lines
    const chunks = engine.chunkFile('test-file.ts', content, 5, 2);
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].filePath).toBe('test-file.ts');
    expect(chunks[0].startLine).toBe(1);
    expect(chunks[0].endLine).toBe(5);

    // Overlap checks: next starts at startLine + (windowSize - overlap) = 0 + (5 - 2) = 3 -> 4th line (1-indexed is 4)
    expect(chunks[1].startLine).toBe(4);
    expect(chunks[1].endLine).toBe(8);
  });

  test('should index and perform search using TF-IDF and Cosine Similarity', () => {
    const files = [
      {
        path: 'src/domain/user.entity.ts',
        content: 'export class UserEntity {\n  constructor(public readonly id: string, public name: string) {}\n}'
      },
      {
        path: 'src/adapters/database.ts',
        content: 'import { Connection } from "postgres";\nexport class DatabaseAdapter {\n  public connect() {}\n}'
      }
    ];

    engine.buildIndex(files);
    
    // Search query matching "user entity construction"
    const resultsUser = engine.search('user entity name', 5);
    expect(resultsUser.length).toBeGreaterThan(0);
    expect(resultsUser[0].chunk.filePath).toBe('src/domain/user.entity.ts');

    // Search query matching "database connection"
    const resultsDb = engine.search('postgres connection connect', 5);
    expect(resultsDb.length).toBeGreaterThan(0);
    expect(resultsDb[0].chunk.filePath).toBe('src/adapters/database.ts');
  });
});
