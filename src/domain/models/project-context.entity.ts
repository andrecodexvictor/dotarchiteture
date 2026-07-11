export type TeamMaturity = 'junior' | 'intermediate' | 'advanced';
export type DomainComplexity = 'low' | 'medium' | 'high';
export type ScalingLevel = 'low' | 'medium' | 'high';
export type AvailabilityLevel = 'low' | 'medium' | 'high';

export interface ProjectContext {
  teamSize: number;
  teamMaturity: TeamMaturity;
  domainComplexity: DomainComplexity;
  scale: ScalingLevel;
  availability: AvailabilityLevel;
  auditability: boolean;
  targetStack: string;
}
