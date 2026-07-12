# Changelog - dotarchitecture recommendation logic

All notable changes to the architectural decision heuristics and active validation rules of this project will be documented in this file.

## [1.1.0] - 2026-07-12
### Added
- Created formal JSON input validation schema (`decision-input.schema.json`).
- Introduced decision rules under `rules/if-then/`, `rules/defaults.md`, and `rules/invariants.md`.
- Added structural catalog templates for Clean, Hexagonal, MVC, and Modular Monolith architectures.
- Added automated Jest testing specifications for individual rules (`tests/rules/`) and e2e scenarios (`tests/scenarios/`).
- Added governance checklists (`REVIEW-CHECKLIST.md`) and code owners mappings (`OWNERS.md`).
