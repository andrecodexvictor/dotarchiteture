import { FileSystemPort } from '../ports/file-system.port';
import { SemanticSearchEngine, CodeChunk } from '../../domain/services/semantic-search-engine.service';
import { GeminiEmbeddingsAdapter } from '../../adapters/secondary/semantic-search/gemini-embeddings.adapter';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface SearchResult {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  score: number;
}

export class SearchCodebaseUseCase {
  private static engine: SemanticSearchEngine | null = null;
  private static indexedFiles: string[] = [];
  private embeddingCachePath: string;
  private embeddingCache: Record<string, number[]> = {};

  constructor(
    private fileSystemPort: FileSystemPort,
    private geminiEmbeddings: GeminiEmbeddingsAdapter
  ) {
    const homedir = os.homedir();
    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
      this.embeddingCachePath = path.join(appData, 'dotarchitecture', 'embeddings_cache.json');
    } else {
      this.embeddingCachePath = path.join(homedir, '.cache', 'dotarchitecture', 'embeddings_cache.json');
    }
  }

  private async loadEmbeddingCache(): Promise<void> {
    try {
      const data = await fs.readFile(this.embeddingCachePath, 'utf-8');
      this.embeddingCache = JSON.parse(data);
    } catch {
      this.embeddingCache = {};
    }
  }

  private async saveEmbeddingCache(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.embeddingCachePath), { recursive: true });
      await fs.writeFile(this.embeddingCachePath, JSON.stringify(this.embeddingCache, null, 2), 'utf-8');
    } catch {
      // Ignore cache write errors
    }
  }

  private getChunkCacheKey(chunk: CodeChunk): string {
    // Generate a simple unique key for a chunk based on file path, lines, and content hash/length
    return `${chunk.filePath}:${chunk.startLine}-${chunk.endLine}:${chunk.content.length}`;
  }

  public async execute(query: string, limit: number = 5): Promise<SearchResult[]> {
    // 1. Scan files
    const allFiles = await this.fileSystemPort.scanFiles();
    const codeFiles = allFiles.filter(f =>
      f.endsWith('.ts') ||
      f.endsWith('.js') ||
      f.endsWith('.go') ||
      f.endsWith('.py') ||
      f.endsWith('.java') ||
      f.endsWith('.md')
    );

    // 2. Initialize and build local TF-IDF index if not matching
    const needsReindex =
      !SearchCodebaseUseCase.engine ||
      SearchCodebaseUseCase.indexedFiles.length !== codeFiles.length ||
      !codeFiles.every(f => SearchCodebaseUseCase.indexedFiles.includes(f));

    if (needsReindex) {
      const engine = new SemanticSearchEngine();
      const filesWithContent: Array<{ path: string; content: string }> = [];

      for (const file of codeFiles) {
        try {
          const content = await this.fileSystemPort.readFileContent(file);
          filesWithContent.push({ path: file, content });
        } catch {
          // Skip unreadable files
        }
      }

      engine.buildIndex(filesWithContent);
      SearchCodebaseUseCase.engine = engine;
      SearchCodebaseUseCase.indexedFiles = codeFiles;
    }

    const engine = SearchCodebaseUseCase.engine!;

    // 3. Search local TF-IDF
    // We retrieve more candidates than the limit to perform reranking
    const localCandidates = engine.search(query, 50);
    if (localCandidates.length === 0) return [];

    // 4. If Gemini API is available, perform hybrid search / reranking
    if (this.geminiEmbeddings.isAvailable()) {
      await this.loadEmbeddingCache();
      try {
        const queryVector = await this.geminiEmbeddings.getEmbedding(query);
        const scoredResults: SearchResult[] = [];
        let cacheUpdated = false;

        for (const cand of localCandidates) {
          const chunk = cand.chunk;
          const cacheKey = this.getChunkCacheKey(chunk);
          let chunkVector = this.embeddingCache[cacheKey];

          if (!chunkVector) {
            try {
              // Fetch embedding for this chunk and save to cache
              chunkVector = await this.geminiEmbeddings.getEmbedding(chunk.content);
              this.embeddingCache[cacheKey] = chunkVector;
              cacheUpdated = true;
            } catch {
              // Fallback: if single chunk embedding fails, skip reranking for it or use similarity 0
              chunkVector = [];
            }
          }

          let denseScore = 0;
          if (chunkVector.length > 0) {
            denseScore = this.geminiEmbeddings.computeCosineSimilarity(queryVector, chunkVector);
          }

          // Blended Hybrid score: 30% Keyword (TF-IDF) + 70% Semantic (Dense Vector)
          const blendedScore = 0.3 * cand.score + 0.7 * denseScore;

          scoredResults.push({
            filePath: chunk.filePath,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            content: chunk.content,
            score: blendedScore
          });
        }

        if (cacheUpdated) {
          await this.saveEmbeddingCache();
        }

        return scoredResults.sort((a, b) => b.score - a.score).slice(0, limit);
      } catch (err) {
        // Fall back to pure keyword search if query embedding fails
      }
    }

    // Default: return pure keyword TF-IDF results
    return localCandidates.map(c => ({
      filePath: c.chunk.filePath,
      startLine: c.chunk.startLine,
      endLine: c.chunk.endLine,
      content: c.chunk.content,
      score: c.score
    }));
  }
}
