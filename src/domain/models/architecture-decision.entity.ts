export type HighLevelArchitecture = 'monolith' | 'modular-monolith' | 'microservices' | 'event-driven' | 'serverless';
export type InternalPattern = 'mvc' | 'layered' | 'hexagonal' | 'clean';

export interface ReferenceRepo {
  name: string;
  url: string;
}

export interface DesignPatternReference {
  name: string;
  type: string;
  url: string;
  referenceRepos: ReferenceRepo[];
}

export interface RejectedArchitecture {
  architecture: string;
  reason: string;
}

export interface ArchitectureDecision {
  recommendedArchitecture: HighLevelArchitecture;
  rejectedArchitectures: RejectedArchitecture[];
  recommendedInternalPattern: InternalPattern;
  recommendedDevStyle: string[];
  observabilityDeployGuidelines: string[];
  warnings: string[];
  patterns: DesignPatternReference[];
}
