import * as https from 'https';

export class GeminiEmbeddingsAdapter {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  public isAvailable(): boolean {
    return !!this.apiKey;
  }

  public getEmbedding(text: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      if (!this.apiKey) {
        reject(new Error('Gemini API key is not configured.'));
        return;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`;
      const payload = JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }]
        }
      });

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(url, options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`Embeddings API returned code ${res.statusCode}: ${rawData}`));
              return;
            }
            const parsed = JSON.parse(rawData);
            const values = parsed?.embedding?.values;
            if (Array.isArray(values)) {
              resolve(values);
            } else {
              reject(new Error('Invalid embeddings format returned by Gemini API.'));
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }

  public computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
