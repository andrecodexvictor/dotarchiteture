import { DecisionEngine } from '../../src/domain/services/decision-engine.service';
import { ProjectContext } from '../../src/domain/models/project-context.entity';

describe('DecisionEngine', () => {
  const baseContext: ProjectContext = {
    teamSize: 3,
    teamMaturity: 'junior',
    domainComplexity: 'low',
    scale: 'low',
    availability: 'low',
    auditability: false,
    targetStack: 'typescript/nestjs'
  };

  test('should recommend monolith for low complexity and small team', () => {
    const decision = DecisionEngine.evaluate(baseContext);
    expect(decision.recommendedArchitecture).toBe('monolith');
    expect(decision.recommendedInternalPattern).toBe('mvc');
    expect(decision.warnings).toHaveLength(0);
  });

  test('should recommend modular-monolith for medium team and high complexity', () => {
    const context: ProjectContext = {
      ...baseContext,
      teamSize: 8,
      teamMaturity: 'intermediate',
      domainComplexity: 'high'
    };
    const decision = DecisionEngine.evaluate(context);
    expect(decision.recommendedArchitecture).toBe('modular-monolith');
    expect(decision.recommendedInternalPattern).toBe('hexagonal');
  });

  test('should recommend microservices for large team, high scale, and high availability', () => {
    const context: ProjectContext = {
      ...baseContext,
      teamSize: 20,
      teamMaturity: 'advanced',
      domainComplexity: 'high',
      scale: 'high',
      availability: 'high'
    };
    const decision = DecisionEngine.evaluate(context);
    expect(decision.recommendedArchitecture).toBe('microservices');
  });

  test('should trigger warning when microservices is forced on small team via overrides', () => {
    const decision = DecisionEngine.evaluate(baseContext, {}, { architecture: 'microservices' });
    expect(decision.recommendedArchitecture).toBe('microservices');
    expect(decision.warnings.some(w => w.includes('Over-engineering Warning'))).toBe(true);
  });

  test('should respect custom rules thresholds', () => {
    const context: ProjectContext = {
      ...baseContext,
      teamSize: 6,
      teamMaturity: 'advanced',
      domainComplexity: 'high',
      scale: 'high',
      availability: 'high'
    };
    // Custom threshold: require only 5 developers for microservices instead of default 15
    const decision = DecisionEngine.evaluate(context, { minTeamSizeForMicroservices: 5 });
    expect(decision.recommendedArchitecture).toBe('microservices');
    expect(decision.warnings).toHaveLength(0);
  });
});
