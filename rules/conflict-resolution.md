# Rules: Conflict Resolution (Resolução de Conflitos)

This guide documents how the decision engine resolves concurrent or competing recommendation scores.

## Resolution Rules

1. **Explicit Overrides Priority**:
   * Any configuration defined in the `overrides:` section of the input YAML bypasses scoring matrices completely and is selected directly.

2. **Over-engineering Safety Valve**:
   * If a user overrides the architecture to `microservices` but the team size is less than 15 devs, the engine generates an active warning (`Over-engineering Warning`) in the output reports.

3. **Scoring Tie-Breaker**:
   * In the event of a tie score between two internal patterns (e.g. Hexagonal vs Layered), the engine defaults to the simpler pattern (`layered`) to reduce cognitive and boilerplate overhead.
