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
          reason = `Rejeitado devido ao alto custo operacional. Recomendado apenas para times grandes (>= ${minTeamSizeForMicroservices} membros) com alta complexidade.`;
        } else if (cand === 'modular-monolith') {
          if (recommendedArchitecture === 'monolith') {
            reason = 'Um monólito modular exige maior custo inicial de boilerplate que não se justifica para este projeto de menor complexidade.';
          } else {
            reason = 'A arquitetura selecionada oferece melhor escalabilidade física ou alinhamento com serviços em nuvem.';
          }
        } else if (cand === 'monolith') {
          reason = 'Um monólito seria um gargalo para a velocidade de entrega do time, deploy desacoplado ou escalabilidade horizontal.';
        } else if (cand === 'event-driven') {
          reason = 'Sistemas orientados a eventos trazem complexidade de tracing e consistência eventual que não são justificadas neste escopo.';
        } else if (cand === 'serverless') {
          reason = 'Estruturas serverless criam alto acoplamento com provedores de nuvem e gargalos de cold start que não alinham com o perfil.';
        }
        rejectedArchitectures.push({ architecture: cand, reason });
      }
    }

    // 4. Resolve Dev Styles
    const recommendedDevStyle: string[] = [];
    if (context.teamMaturity === 'advanced') {
      recommendedDevStyle.push(
        'TDD (Test-Driven Development) para regras críticas de negócio',
        'Trunk-Based Development com Pull Requests de vida curta (< 4 horas)',
        'Pipelines de CI/CD automatizadas aplicando testes e cobertura rígida (> 90%)',
        'Validação arquitetural estrita rodando no pré-commit'
      );
    } else if (context.teamMaturity === 'intermediate') {
      recommendedDevStyle.push(
        'BDD (Behavior-Driven Development) ou alta cobertura de testes unitários/integração',
        'Trunk-Based Development com branchs de features curtas (< 1 dia)',
        'Pipelines de Integração Contínua com gates de validação nos Pull Requests'
      );
    } else {
      recommendedDevStyle.push(
        'Fluxo de trabalho Gitflow com revisões estruturadas por pares',
        'Testes unitários automatizados executados antes do push',
        'Foco em cobrir com testes simples utilitários e rotas principais primeiro'
      );
    }

    // 5. Resolve Observability & Deploy
    const observabilityDeployGuidelines: string[] = [];
    if (recommendedArchitecture === 'microservices' || recommendedArchitecture === 'event-driven') {
      observabilityDeployGuidelines.push(
        'Tracing Distribuído (ex: OpenTelemetry) para rastrear requisições entre serviços',
        'Agregação centralizada de logs (ex: ELK stack ou Datadog) com correlation IDs únicos',
        'Service discovery e balanceamento de carga ativo',
        'Estratégias de deploy Canary ou Blue-Green para atualizações seguras'
      );
    } else if (recommendedArchitecture === 'serverless') {
      observabilityDeployGuidelines.push(
        'Tracing nativo de nuvem (ex: AWS X-Ray) para execuções serverless',
        'Métricas de execução detalhando cold starts e timeouts',
        'Políticas graduais de implantação (gradual linear rollouts)'
      );
    } else {
      observabilityDeployGuidelines.push(
        'Application Performance Monitoring (APM) para acompanhar gargalos de rota e consumo de CPU',
        'Rotação e agregação local de logs',
        'Deploy Rolling Update simples ou Blue-Green básico'
      );
    }

    // 6. Generate Custom Personalized Rationale
    let customRationale = `Com base no contexto do projeto, avaliamos um time de **${context.teamSize} desenvolvedor(es)** com maturidade **${context.teamMaturity}**, lidando com um domínio de complexidade **${context.domainComplexity}**. `;
    
    if (context.teamSize === 1) {
      customRationale += `Como você está desenvolvendo de forma solo (1 dev), a escolha por **${recommendedArchitecture}** evita overhead operacional e de infraestrutura complexa, focando em velocidade máxima de entrega. `;
    } else if (context.teamSize >= 15) {
      customRationale += `Com um time grande de ${context.teamSize} devs, a arquitetura **${recommendedArchitecture}** é crucial para segmentar as responsabilidades e evitar conflitos frequentes de fusão (merge conflicts) e bloqueios de deploy. `;
    } else {
      customRationale += `Com um time médio de ${context.teamSize} devs, sugerimos a abordagem **${recommendedArchitecture}** para facilitar a cooperação em paralelo sem a complexidade de rede e orquestração de múltiplos microsserviços. `;
    }

    if (context.domainComplexity === 'high') {
      customRationale += `A alta complexidade do seu domínio exige o padrão **${recommendedInternalPattern}** para garantir isolamento absoluto do core business em relação a dependências externas e infraestrutura. `;
    } else if (context.domainComplexity === 'medium') {
      customRationale += `O domínio de complexidade média sugere o padrão **${recommendedInternalPattern}**, oferecendo um bom equilíbrio entre separação de responsabilidades e agilidade de desenvolvimento. `;
    } else {
      customRationale += `Como a complexidade de domínio é baixa, sugerimos um padrão direto como **${recommendedInternalPattern}** para acelerar a validação e evitar códigos de boilerplate excessivos. `;
    }

    if (context.scale === 'high') {
      customRationale += `Devido aos altos requisitos de escalabilidade declarados, a arquitetura interna foi otimizada para suportar alta concorrência de acessos. `;
    }

    // 7. Resolve Scaffold Folders (casing checking for stack-specific paths)
    const recommendedFolderScaffold: Array<{ path: string; purpose: string }> = [];
    const stack = context.targetStack.toLowerCase();

    if (recommendedInternalPattern === 'hexagonal' || recommendedInternalPattern === 'clean') {
      if (stack.includes('typescript') || stack.includes('nestjs') || stack.includes('node')) {
        recommendedFolderScaffold.push(
          { path: 'src/domain/models', purpose: 'Entidades ricas de domínio contendo a lógica central de negócio (ex: user.entity.ts).' },
          { path: 'src/domain/services', purpose: 'Serviços de domínio que lidam com regras envolvendo múltiplos modelos.' },
          { path: 'src/application/use-cases', purpose: 'Casos de uso da aplicação (interatores, commands/queries) orquestrando fluxos.' },
          { path: 'src/application/ports', purpose: 'Interfaces TypeScript definindo contratos para banco de dados e APIs externas.' },
          { path: 'src/adapters/primary', purpose: 'Controladores HTTP NestJS, resolvers GraphQL ou assinantes de eventos.' },
          { path: 'src/adapters/secondary', purpose: 'Implementações de repositório (TypeORM, Prisma), clients HTTP ou integrações físicas.' }
        );
      } else if (stack.includes('go') || stack.includes('gin') || stack.includes('fiber')) {
        recommendedFolderScaffold.push(
          { path: 'domain/models', purpose: 'Go Structs contendo a definição e validações lógicas dos modelos de domínio.' },
          { path: 'domain/services', purpose: 'Funções de domínio puro para regras de negócio compartilhadas.' },
          { path: 'application/usecases', purpose: 'Estruturas Go de casos de uso com dependências injetadas por interfaces.' },
          { path: 'application/ports', purpose: 'Interfaces Go definindo contratos de entrada/saída (repositories, publishers).' },
          { path: 'adapters/primary', purpose: 'Mapeamento de rotas e handlers HTTP (Gin/Fiber).' },
          { path: 'adapters/secondary', purpose: 'Implementação de persistência GORM e gateways de integração.' }
        );
      } else {
        recommendedFolderScaffold.push(
          { path: 'src/domain', purpose: 'Entidades e regras de negócio puras (independente de frameworks).' },
          { path: 'src/application', purpose: 'Regras de aplicação e casos de uso.' },
          { path: 'src/ports', purpose: 'Interfaces e contratos abstratos de dependência.' },
          { path: 'src/adapters/primary', purpose: 'Ponto de entrada do sistema (APIs, CLI, WebSockets).' },
          { path: 'src/adapters/secondary', purpose: 'Persistência física, mensageria e integrações externas.' }
        );
      }
    } else if (recommendedInternalPattern === 'layered') {
      recommendedFolderScaffold.push(
        { path: 'src/presentation', purpose: 'Controladores e componentes de visualização encarregados da interação com o cliente.' },
        { path: 'src/application', purpose: 'Serviços de aplicação coordenando ações e fluxos de dados.' },
        { path: 'src/domain', purpose: 'Entidades e lógica de domínio do projeto.' },
        { path: 'src/infrastructure', purpose: 'Acesso ao banco de dados, repositórios concretos e utilitários técnicos.' }
      );
    } else {
      recommendedFolderScaffold.push(
        { path: 'src/controllers', purpose: 'Controladores que recebem requisições e atualizam os modelos.' },
        { path: 'src/models', purpose: 'Classes de dados e lógica de ORM direta.' },
        { path: 'src/views', purpose: 'Templates HTML ou serializadores e views JSON de retorno.' }
      );
    }

    // 8. Resolve Tailored Design Patterns
    const tailoredDesignPatterns: Array<{ name: string; description: string }> = [];
    
    if (context.auditability) {
      tailoredDesignPatterns.push({
        name: 'Event Sourcing / Ledger Pattern',
        description: 'Salvar alterações no estado das entidades como uma sequência imutável de eventos de domínio.'
      });
    }

    if (context.domainComplexity === 'high') {
      tailoredDesignPatterns.push(
        {
          name: 'Domain Repository Pattern',
          description: 'Isolar o acesso aos agregados de persistência por meio de repositórios orientados a domínio.'
        },
        {
          name: 'Value Objects',
          description: 'Modelar atributos complexos (ex: CPF, Endereço, Dinheiro) como objetos imutáveis com validações próprias.'
        }
      );
    }

    if (context.scale === 'high' && (context.teamMaturity === 'advanced' || context.teamMaturity === 'intermediate')) {
      tailoredDesignPatterns.push(
        {
          name: 'CQRS (Command Query Responsibility Segregation)',
          description: 'Separar os caminhos lógicos de leitura e escrita do sistema para maximizar performance e escala.'
        },
        {
          name: 'Cache-Aside Pattern',
          description: 'Salvar leituras frequentes de banco de dados em cache em memória (ex: Redis), atualizando-as sob demanda.'
        }
      );
    }

    if (context.teamMaturity === 'junior') {
      tailoredDesignPatterns.push({
        name: 'Transaction Script / Active Record',
        description: 'Evitar padrões excessivos do DDD; focar em scripts diretos e ORM ativo para acelerar o desenvolvimento do time.'
      });
    }

    return {
      recommendedArchitecture,
      rejectedArchitectures,
      recommendedInternalPattern,
      recommendedDevStyle,
      observabilityDeployGuidelines,
      warnings,
      patterns: [],
      customRationale,
      recommendedFolderScaffold,
      tailoredDesignPatterns
    };
  }
}
