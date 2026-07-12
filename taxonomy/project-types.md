# Taxonomy: Project Types

This document classifies project types according to their operational goals.

## Project Types

### SaaS (Software as a Service)
Multi-tenant product serving external clients. Requires high scalability, tenant isolation, availability, and audit logs.

### Backoffice
Internal operational dashboards or admin applications. Domain complexity is low-medium, availability and latencies are less critical.

### Public API
API exposed to external clients/developers. Focus on strict RESTful standards, OpenAPI, rate-limiting, and low-latency response times.

### Internal Integration
Connects internal systems or acts as middleware. Typically messaging/queue based; throughput and reliability are key.

### Library / SDK
Reusable package or utility module. Priority is minimal dependencies, versioning, and developer ergonomics.

### CLI (Command Line Interface)
Offline terminal tools. High startup speed requirement, stdout/stderr compliance, zero service runtime dependencies.

### Agentic AI (IA Agentic)
Systems interacting with LLMs, orchestrating workflows with agent autonomy. Requires prompt engineering structures, workflow persistence, and execution trace logging.
