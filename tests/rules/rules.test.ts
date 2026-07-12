import { DecisionEngine } from '../../src/domain/services/decision-engine.service';
import { ProjectContext } from '../../src/domain/models/project-context.entity';

describe('Decision Matrix Heuristics', () => {
  const baseContext: ProjectContext = {
    teamSize: 10,
    teamMaturity: 'intermediate',
    domainComplexity: 'medium',
    scale: 'low',
    availability: 'low',
    auditability: false,
    targetStack: 'typescript/nestjs'
  };

  test('should score and recommend modular monolith for team size between 5 and 14 with medium complexity', () => {
    const decision = DecisionEngine.evaluate(baseContext);
    expect(decision.recommendedArchitecture).toBe('modular-monolith');
  });

  test('should recommend hexagonal internal pattern for advanced teams with high domain complexity', () => {
    const context: ProjectContext = {
      ...baseContext,
      teamMaturity: 'advanced',
      domainComplexity: 'high'
    };
    const decision = DecisionEngine.evaluate(context);
    expect(decision.recommendedInternalPattern).toBe('hexagonal');
  });
});
