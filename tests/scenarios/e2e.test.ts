import { DecisionEngine } from '../../src/domain/services/decision-engine.service';
import { ProjectContext } from '../../src/domain/models/project-context.entity';

describe('End-to-End Recommendation Flow Simulation', () => {
  test('evaluates complex startup project context completely', () => {
    const inputContext: ProjectContext = {
      teamSize: 6,
      teamMaturity: 'advanced',
      domainComplexity: 'high',
      scale: 'medium',
      availability: 'high',
      auditability: true,
      targetStack: 'typescript/nestjs'
    };

    const decision = DecisionEngine.evaluate(inputContext);

    // Assert recommended styles
    expect(decision.recommendedArchitecture).toBe('modular-monolith');
    expect(decision.recommendedInternalPattern).toBe('hexagonal');
    expect(decision.tailoredDesignPatterns).toContainEqual(
      expect.objectContaining({ name: 'Domain Repository Pattern' })
    );
  });
});
