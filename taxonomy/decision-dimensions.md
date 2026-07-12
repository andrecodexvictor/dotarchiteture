# Taxonomy: Decision Dimensions

Decisions are classified across core dimensions:

## 1. Modularity (Modularidade)
Determines physical separation:
* Shared process (Monolith)
* Isolated namespaces (Modular Monolith)
* Network separation (Microservices)

## 2. Data Strategy (Dados)
Defines storage structure:
* Single shared database
* Database-per-service (Microservices)
* Event-sourcing ledger

## 3. Deployment & Infrastructure
Determines target runtime environment:
* Serverless container
* Managed VM (EC2, Droplet)
* Container cluster (K8s)

## 4. Integration & Communication
Determines service interaction mode:
* Synchronous REST/gRPC
* Asynchronous queues / brokers

## 5. Observability (Observabilidade)
Determines monitoring architecture:
* local rolling logs
* Centralized dashboard aggregation (OpenTelemetry)
