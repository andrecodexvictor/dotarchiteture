import { ArchitectureDecision } from '../../domain/models/architecture-decision.entity';

export interface HookDispatcherPort {
  dispatch(
    eventName: 'onNewModuleDesigned' | 'onArchitectureChange' | 'onADRAdded',
    decision: ArchitectureDecision,
    context?: any
  ): Promise<void>;
  registerPlugins(pluginPaths: string[]): Promise<void>;
}
