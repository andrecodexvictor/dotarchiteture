# Domain Glossary / Vocabulário Canônico

This canonical glossary establishes standard terminology for developers, product managers, and AI assistants.

## Core Terms

### Bounded Context (Contexto Delimitado)
A boundary within which a domain model applies. Inside the boundary, all terms have a specific meaning and are logically consistent.

### Aggregate (Agregado)
A cluster of domain objects (entities and value objects) that can be treated as a single unit. An aggregate is modified through its root entity.

### Domain Event (Evento de Domínio)
An event that represents a significant business occurrence in the system (e.g. `OrderPlaced`, `UserRegistered`).

### Driven Adapter (Adaptador Dirigido / Secundário)
A component that implements an application port interface to interact with external systems (e.g. database client, email publisher).

### Driving Adapter (Adaptador Condutor / Primário)
A component that receives inputs from users or external systems and triggers application use-cases (e.g. HTTP controller, CLI argument parser).

### Port (Porta)
An inbound or outbound interface defining contract rules between the application logic and adapters.
