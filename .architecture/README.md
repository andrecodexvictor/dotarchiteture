# Architecture Guide for AI Agents

This directory contains architectural decisions and constraints for this repository.

## Decisions Record
* **System Model**: modular-monolith
* **Internal Pattern**: hexagonal

## Guidelines & Rules for Coding
1. **Directory Rules**: Respect the structure defined in [folder-structure.md](../docs/adr/folder-structure.md). Do not bypass modules.
2. **Dependency Rules**:
   - Clean architecture flows inwards.
   - Core domain must not import external routers, databases, or frameworks.
3. **Execution Verification**:
   - Run `dotarchitecture verify` to check for import and directory violations before submitting PRs.

## Current Warnings
* No active alerts.
