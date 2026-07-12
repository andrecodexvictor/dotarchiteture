# Development Workflow Guidelines

This document outlines the coding workflow and development patterns recommended for this codebase.

## Recommended Engineering Styles
* BDD (Behavior-Driven Development) ou alta cobertura de testes unitários/integração
* Trunk-Based Development com branchs de features curtas (< 1 dia)
* Pipelines de Integração Contínua com gates de validação nos Pull Requests

## Extension Ganchos / Event Hooks
These hooks allow triggering validation scripts during key development lifecycles:
* `onNewModuleDesigned`: Executes when new modules are designed.
* `onArchitectureChange`: Executes when architecture files change.
* `onADRAdded`: Executes when a new ADR is compiled.
