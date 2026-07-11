import { DesignPatternReference } from '../../domain/models/architecture-decision.entity';

export interface PatternCatalogPort {
  getPatternsForStack(targetStack: string, patternStyle: string): Promise<DesignPatternReference[]>;
}
