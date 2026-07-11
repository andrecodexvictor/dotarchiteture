export interface CodeChunk {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  tokens: string[];
  tfidfVector?: Record<string, number>;
}

export class SemanticSearchEngine {
  private chunks: CodeChunk[] = [];
  private idfRegistry: Record<string, number> = Object.create(null);
  private stopwords = new Set([
    // Standard English stop words
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
    'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
    'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt',
    'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
    'ourselves', 'out', 'over', 'own', 'same', 'shannt', 'she', 'should', 'shouldnt', 'so', 'some', 'such', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'this',
    'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'were', 'werent', 'what',
    'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'wont', 'would', 'wouldnt', 'you', 'your',
    'yours', 'yourself', 'yourselves',
    
    // Programming language keywords and constructs
    'class', 'public', 'private', 'protected', 'extends', 'implements', 'import', 'export', 'from', 'require',
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'constructor', 'readonly', 'string',
    'number', 'boolean', 'any', 'void', 'interface', 'type', 'default', 'package', 'func', 'struct', 'map', 'chan',
    'nil', 'true', 'false', 'null', 'undefined', 'def', 'self', 'import', 'from', 'as', 'lambda', 'with', 'try'
  ]);

  constructor() {}

  /**
   * Tokenizes code content into clean alphanumeric lowercase terms.
   */
  public tokenize(content: string): string[] {
    // Split by camelCase, PascalCase, snake_case, and non-alphanumeric chars
    const rawTokens = content
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/[^a-zA-Z0-9]/g, ' ')       // remove punctuation
      .toLowerCase()
      .split(/\s+/);

    return rawTokens.filter(t => t.length > 1 && !this.stopwords.has(t));
  }

  /**
   * Chunks a file into overlapping windows of code.
   */
  public chunkFile(filePath: string, content: string, windowSize: number = 25, overlap: number = 5): CodeChunk[] {
    const lines = content.split(/\r?\n/);
    const fileChunks: CodeChunk[] = [];

    let start = 0;
    while (start < lines.length) {
      const end = Math.min(start + windowSize, lines.length);
      const chunkLines = lines.slice(start, end);
      const chunkContent = chunkLines.join('\n');
      
      if (chunkContent.trim().length > 0) {
        fileChunks.push({
          filePath,
          startLine: start + 1,
          endLine: end,
          content: chunkContent,
          tokens: this.tokenize(chunkContent)
        });
      }

      start += (windowSize - overlap);
      if (end === lines.length) break;
    }

    return fileChunks;
  }

  /**
   * Builds the TF-IDF index across all registered codebase chunks.
   */
  public buildIndex(files: Array<{ path: string; content: string }>): void {
    this.chunks = [];
    this.idfRegistry = Object.create(null);

    // 1. Chunk all files
    for (const file of files) {
      const fileChunks = this.chunkFile(file.path, file.content);
      this.chunks.push(...fileChunks);
    }

    const totalDocs = this.chunks.length;
    if (totalDocs === 0) return;

    // 2. Count document frequencies (DF) for each term
    const docFrequencies: Record<string, number> = Object.create(null);
    for (const chunk of this.chunks) {
      const uniqueTermsInDoc = new Set(chunk.tokens);
      for (const term of uniqueTermsInDoc) {
        docFrequencies[term] = (docFrequencies[term] || 0) + 1;
      }
    }

    // 3. Compute Inverse Document Frequencies (IDF)
    for (const [term, df] of Object.entries(docFrequencies)) {
      this.idfRegistry[term] = Math.log(totalDocs / df) + 1; // smoothed IDF
    }

    // 4. Compute TF-IDF vectors for each chunk
    for (const chunk of this.chunks) {
      const termCounts: Record<string, number> = Object.create(null);
      for (const token of chunk.tokens) {
        termCounts[token] = (termCounts[token] || 0) + 1;
      }

      const tfidfVector: Record<string, number> = Object.create(null);
      const totalTokens = chunk.tokens.length;

      for (const [term, count] of Object.entries(termCounts)) {
        const tf = count / totalTokens;
        const idf = this.idfRegistry[term] || 0;
        tfidfVector[term] = tf * idf;
      }

      chunk.tfidfVector = tfidfVector;
    }
  }

  /**
   * Computes cosine similarity between two tfidf vectors.
   */
  private computeCosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    // We can iterate over the query vector keys for dot product
    for (const [term, valA] of Object.entries(vecA)) {
      const valB = vecB[term] || 0;
      dotProduct += valA * valB;
      magnitudeA += valA * valA;
    }

    for (const valB of Object.values(vecB)) {
      magnitudeB += valB * valB;
    }

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  }

  /**
   * Performs semantic query search against the indexed chunks.
   */
  public search(query: string, limit: number = 5): Array<{ chunk: CodeChunk; score: number }> {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    // 1. Calculate query TF-IDF vector
    const queryTermCounts: Record<string, number> = Object.create(null);
    for (const token of queryTokens) {
      queryTermCounts[token] = (queryTermCounts[token] || 0) + 1;
    }

    const queryVector: Record<string, number> = Object.create(null);
    const totalQueryTokens = queryTokens.length;

    for (const [term, count] of Object.entries(queryTermCounts)) {
      const tf = count / totalQueryTokens;
      const idf = this.idfRegistry[term] || 0;
      queryVector[term] = tf * idf;
    }

    // 2. Score all chunks
    const results: Array<{ chunk: CodeChunk; score: number }> = [];
    for (const chunk of this.chunks) {
      if (!chunk.tfidfVector) continue;
      const score = this.computeCosineSimilarity(queryVector, chunk.tfidfVector);
      if (score > 0) {
        results.push({ chunk, score });
      }
    }

    // 3. Sort and limit
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
