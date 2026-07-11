import { ProjectContext } from '../models/project-context.entity';
import { ArchitectureDecision, HighLevelArchitecture, InternalPattern, RejectedArchitecture } from '../models/architecture-decision.entity';

export class DecisionEngine {
  public static evaluate(
    context: ProjectContext,
    customRules: Record<string, any> = {},
    overrides: Record<string, any> = {}
  ): ArchitectureDecision {
    const warnings: string[] = [];

    // 1. Resolve High-Level Architecture
    let recommendedArchitecture: HighLevelArchitecture;
    const minTeamSizeForMicroservices = Number(customRules.minTeamSizeForMicroservices ?? 15);
    const minScaleForEventDriven = customRules.minScaleForEventDriven ?? 'high';

    if (overrides.architecture) {
      recommendedArchitecture = overrides.architecture as HighLevelArchitecture;
      
      // Perform over-engineering check for warnings
      if (recommendedArchitecture === 'microservices' && context.teamSize < minTeamSizeForMicroservices) {
        warnings.push(
          `[Over-engineering Warning] Microservices architecture was forced via overrides for a small team (${context.teamSize} developers). This is highly likely to introduce severe operational overhead.`
        );
      }
    } else {
      if (
        context.scale === 'high' &&
        context.availability === 'high' &&
        context.teamSize >= minTeamSizeForMicroservices
      ) {
        recommendedArchitecture = 'microservices';
      } else if (
        context.scale === minScaleForEventDriven &&
        (context.domainComplexity === 'high' || context.domainComplexity === 'medium')
      ) {
        recommendedArchitecture = 'event-driven';
      } else if (
        context.teamSize >= 5 &&
        context.teamSize < minTeamSizeForMicroservices &&
        (context.domainComplexity === 'high' || context.domainComplexity === 'medium')
      ) {
        recommendedArchitecture = 'modular-monolith';
      } else if (
        context.scale === 'low' &&
        context.availability === 'low' &&
        context.teamSize <= 10 &&
        (context.targetStack.toLowerCase().includes('serverless') || context.targetStack.toLowerCase().includes('aws'))
      ) {
        recommendedArchitecture = 'serverless';
      } else {
        recommendedArchitecture = 'monolith';
      }
    }

    // 2. Resolve Internal Pattern
    let recommendedInternalPattern: InternalPattern;
    if (overrides.pattern) {
      recommendedInternalPattern = overrides.pattern as InternalPattern;
    } else {
      if (context.domainComplexity === 'high' || context.auditability) {
        if (context.teamMaturity === 'advanced' || context.teamMaturity === 'intermediate') {
          recommendedInternalPattern = 'hexagonal';
        } else {
          recommendedInternalPattern = 'layered';
        }
      } else if (context.domainComplexity === 'medium') {
        recommendedInternalPattern = 'layered';
      } else {
        recommendedInternalPattern = 'mvc';
      }
    }

    // 3. Rejected Architectures & Rationale
    const rejectedArchitectures: RejectedArchitecture[] = [];
    const candidates: HighLevelArchitecture[] = ['monolith', 'modular-monolith', 'microservices', 'event-driven', 'serverless'];
    
    for (const cand of candidates) {
      if (cand !== recommendedArchitecture) {
        let reason = '';
        if (cand === 'microservices') {
          reason = `Rejected due to high operational cost and complexity. Recommended only for large teams (>= ${minTeamSizeForMicroservices} members) with complex domains.`;
        } else if (cand === 'modular-monolith') {
          if (recommendedArchitecture === 'monolith') {
            reason = 'A modular monolith requires higher initial boilerplate and structural discipline, which is unnecessary for low-complexity products.';
          } else {
            reason = 'The selected architecture provides better scaling characteristics or direct cloud alignments.';
          }
        } else if (cand === 'monolith') {
          reason = 'A monolith would become a bottleneck for team deployment speeds, domain partitioning, or high throughput scalability requirements.';
        } else if (cand === 'event-driven') {
          reason = 'Event-driven systems introduce complex debugging, tracing, and eventual consistency issues that are not justified under this workload.';
        } else if (cand === 'serverless') {
          reason = 'Serverless structures are highly coupled to cloud execution runtimes and cold-start limitations, which do not align with the runtime requirements.';
        }
        rejectedArchitectures.push({ architecture: cand, reason });
      }
    }

    // 4. Resolve Dev Styles
    const recommendedDevStyle: string[] = [];
    if (context.teamMaturity === 'advanced') {
      recommendedDevStyle.push(
        'TDD (Test-Driven Development) for critical domain logic',
        'Trunk-Based Development with direct commits or short-lived Pull Requests (< 4 hours)',
        'Automated CI/CD pipelines enforcing strict test coverage (> 90%)',
        'Architecture linting checks run on commit hooks'
      );
    } else if (context.teamMaturity === 'intermediate') {
      recommendedDevStyle.push(
        'BDD (Behavior-Driven Development) or high unit/integration test coverage',
        'Trunk-Based Development with short-lived feature branches (< 1 day)',
        'Continuous Integration pipelines with pull-request gatekeepers'
      );
    } else {
      recommendedDevStyle.push(
        'Gitflow workflow with structured peer code reviews',
        'Automated unit tests executed pre-push',
        'Focus on writing simple unit tests for core utilities first'
      );
    }

    // 5. Resolve Observability & Deploy
    const observabilityDeployGuidelines: string[] = [];
    if (recommendedArchitecture === 'microservices' || recommendedArchitecture === 'event-driven') {
      observabilityDeployGuidelines.push(
        'Distributed Tracing (e.g. OpenTelemetry) for cross-service transaction tracing',
        'Centralized log aggregation (e.g. ELK stack or Datadog) with unique correlation IDs',
        'Service discovery and load balancing configuration',
        'Canary deployments or blue-green strategies for low-risk updates'
      );
    } else if (recommendedArchitecture === 'serverless') {
      observabilityDeployGuidelines.push(
        'Cloud-native tracing (e.g. AWS X-Ray) for serverless execution flows',
        'Function-level log streams with metrics on cold starts and timeout thresholds',
        'Traffic-shifting deployment policies (gradual linear rollouts)'
      );
    } else {
      observabilityDeployGuidelines.push(
        'Application Performance Monitoring (APM) for server performance tracking',
        'Log rotation and local system log aggregation',
        'Blue-Green deployments or standard rolling updates'
      );
    }

    return {
      recommendedArchitecture,
      rejectedArchitectures,
      recommendedInternalPattern,
      recommendedDevStyle,
      observabilityDeployGuidelines,
      warnings,
      patterns: [] // Will be populated by application service calling PatternCatalogPort
    };
  }
}
