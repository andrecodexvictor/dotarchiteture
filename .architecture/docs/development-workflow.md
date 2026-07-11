# Development Workflow Guidelines

This document outlines the coding workflow and development patterns recommended for this codebase.

## Recommended Engineering Styles
* BDD (Behavior-Driven Development) or high unit/integration test coverage
* Trunk-Based Development with short-lived feature branches (< 1 day)
* Continuous Integration pipelines with pull-request gatekeepers

## Extension Ganchos / Event Hooks
These hooks allow triggering validation scripts during key development lifecycles:
* `onNewModuleDesigned`: Executes when new modules are designed.
* `onArchitectureChange`: Executes when architecture files change.
* `onADRAdded`: Executes when a new ADR is compiled.
