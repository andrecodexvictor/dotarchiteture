# Taxonomy: Architectural Styles

This taxonomy lists the architectural styles and internal design patterns evaluated by the decision engine.

## High-Level Architectural Styles

### Monolith (Monólito Simples)
Single deployable unit containing all components. Low operational complexity, ideal for MVP stages.

### Modular Monolith (Monólito Modular)
A monolith designed with strict logical boundaries between components (modules) that communicate via explicit, interfaces. Allows scaling to multiple teams without microservices infra overhead.

### Microservices (Microsserviços)
A system decomposed into independently deployable services organized around business capabilities. High operational overhead.

### Event-Driven Architecture (EDA)
A style where software components react to state changes published as events. Highly decoupled, suitable for high scalability.

### Serverless Architecture
Building systems using managed serverless runtimes (AWS Lambda, Cloud Run). Billed by execution time; subject to cold starts.

---

## Internal Code Design Patterns

### MVC (Model-View-Controller)
Traditional three-part structure. Rapid validation of simple apps, poor boundary isolation for business logic.

### Layered (Layered Architecture)
Organization of code in horizontal layers (Presentation, Application, Domain, Infrastructure). Simple dependencies.

### Hexagonal Architecture (Ports & Adapters)
Core domain rules are isolated from external frameworks, infrastructure, and user interfaces via abstraction ports. Highly testable.

### Clean Architecture
Variation of Hexagonal, using concentric dependency circles ensuring the core business logic only depends on abstract rules.
