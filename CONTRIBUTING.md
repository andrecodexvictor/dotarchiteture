# Contributing to dotarchitecture

Thank you for contributing to the architectural knowledge base and engine! This guide outlines how to submit updates to the taxonomies, design patterns, templates, or rule sets.

## Repository Contribution Layout

We organize knowledge contributions under separate folders depending on their target domain:

* **Taxonomy Updates**: If you want to define a new style, project type, or quality attribute, edit/add to the `taxonomy/` folder.
* **Design & Architectural Patterns**: To document patterns, add them under `patterns/architectural/`, `patterns/design/`, `patterns/integration/`, `patterns/frontend/`, or `patterns/data/`. All pattern descriptions should follow the standard layout:
  - Propósito / Contexto
  - Vantagens e Desvantagens
  - Quando usar vs Quando evitar
  - Exemplo prático
* **Rules & Decision Weights**: To adjust the engine logic, edit the YAML files under `rules/`. Update the weights inside `rules/scoring-matrix.yaml` and test the regression suite.
* **Methodologies**: Document development methodologies (e.g. BDD, Gitflow, TDD) inside `methodologies/` following the context schema.
* **Executable Templates**: Put project boilerplate and configuration folder structures inside `templates/`.

## How to Test Your Changes

If you modify the engine scoring matrix or decision heuristics, you must add or verify scenario tests:

1. Add a test case JSON input under `tests/fixtures/` and its expected recommendations under `tests/expected/`.
2. Run `npm run test` to verify that all existing tests pass and your changes do not introduce regression.
3. If necessary, write a unit test spec inside `tests/domain/decision-engine.test.ts`.

## Commit Guidelines

We enforce **Conventional Commits**. Please format your commit messages accordingly:
* `feat(catalog): add event sourcing pattern description`
* `fix(engine): adjust threshold for serverless overrides`
* `docs(readme): update setup guidelines`
