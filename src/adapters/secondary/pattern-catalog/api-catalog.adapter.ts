import { PatternCatalogPort } from '../../../application/ports/pattern-catalog.port';
import { DesignPatternReference } from '../../../domain/models/architecture-decision.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';

export class ApiCatalogAdapter implements PatternCatalogPort {
  private cacheFilePath: string;

  constructor() {
    const homedir = os.homedir();
    if (process.platform === 'win32') {
      const appData = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
      this.cacheFilePath = path.join(appData, 'dotarchitecture', 'cache.json');
    } else {
      this.cacheFilePath = path.join(homedir, '.cache', 'dotarchitecture', 'cache.json');
    }
  }

  private async getCache(): Promise<Record<string, DesignPatternReference[]>> {
    try {
      const data = await fs.readFile(this.cacheFilePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private async writeCache(cache: Record<string, DesignPatternReference[]>): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.cacheFilePath), { recursive: true });
      await fs.writeFile(this.cacheFilePath, JSON.stringify(cache, null, 2), 'utf-8');
    } catch {
      // Ignore cache write failures
    }
  }

  private httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      https.get(url, { headers: { 'User-Agent': 'dotarchitecture-cli' } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
          return;
        }
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => { resolve(rawData); });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  public async getPatternsForStack(targetStack: string, patternStyle: string): Promise<DesignPatternReference[]> {
    const cacheKey = `${targetStack.toLowerCase()}:${patternStyle.toLowerCase()}`;
    const cache = await this.getCache();

    // Try fetching from remote repository raw content
    const remoteUrl = 'https://raw.githubusercontent.com/andrecodexvictor/dotarchiteture/main/resources/catalog.json';

    try {
      // Perform HTTPS request
      const rawData = await this.httpGet(remoteUrl);
      const parsedCatalog = JSON.parse(rawData);

      // Save to cache
      if (parsedCatalog && parsedCatalog[cacheKey]) {
        cache[cacheKey] = parsedCatalog[cacheKey];
        await this.writeCache(cache);
        return parsedCatalog[cacheKey];
      }
    } catch (err) {
      // If fetching fails, read from local cache if present
      if (cache[cacheKey]) {
        return cache[cacheKey];
      }
    }

    // Fully offline/empty cache fallback
    return this.getBuiltInFallback(targetStack, patternStyle);
  }

  private getBuiltInFallback(targetStack: string, patternStyle: string): DesignPatternReference[] {
    const stackLower = targetStack.toLowerCase();
    const patternLower = patternStyle.toLowerCase();

    // 1. NestJS Hexagonal Fallback
    if (stackLower.includes('nestjs') && (patternLower === 'hexagonal' || patternLower === 'clean')) {
      return [
        {
          name: 'Dependency Injection (DI)',
          type: 'Creational / Architectural Pattern',
          url: 'https://refactoring.guru/design-patterns/dependency-injection',
          referenceRepos: [
            { name: 'NestJS Dependency Injection', url: 'https://github.com/nestjs/nest' },
            { name: 'Domain Driven Hexagon (NestJS)', url: 'https://github.com/Sairyss/domain-driven-hexagon' }
          ]
        },
        {
          name: 'Repository Pattern',
          type: 'Structural Pattern / Data access abstraction',
          url: 'https://refactoring.guru/design-patterns/repository',
          referenceRepos: [
            { name: 'TypeScript Clean Architecture Template', url: 'https://github.com/khalilstemmler/solid-book' }
          ]
        }
      ];
    }

    // 2. Go Hexagonal/Clean Fallback
    if (stackLower.includes('go') && (patternLower === 'hexagonal' || patternLower === 'clean')) {
      return [
        {
          name: 'Adapter Pattern',
          type: 'Structural Pattern',
          url: 'https://refactoring.guru/design-patterns/adapter',
          referenceRepos: [
            { name: 'Go Clean Architecture Template', url: 'https://github.com/bxcodec/go-clean-arch' }
          ]
        },
        {
          name: 'Factory Method',
          type: 'Creational Pattern',
          url: 'https://refactoring.guru/design-patterns/factory-method',
          referenceRepos: [
            { name: 'Go Standard Layout Pattern Examples', url: 'https://github.com/golang-standards/project-layout' }
          ]
        }
      ];
    }

    // 3. MVC Fallback
    if (patternLower === 'mvc') {
      return [
        {
          name: 'Active Record Pattern',
          type: 'Architectural / Behavioral Pattern',
          url: 'https://refactoring.guru/design-patterns/active-record',
          referenceRepos: [
            { name: 'TypeORM Active Record Example', url: 'https://github.com/typeorm/typeorm' }
          ]
        }
      ];
    }

    // 4. Default generic fallback
    return [
      {
        name: 'Facade Pattern',
        type: 'Structural Pattern',
        url: 'https://refactoring.guru/design-patterns/facade',
        referenceRepos: [
          { name: 'Awesome Software Architecture & Patterns', url: 'https://github.com/DovAmir/awesome-design-patterns' }
        ]
      }
    ];
  }
}
