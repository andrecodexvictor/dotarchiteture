# Architectural Constraints

This file details the non-negotiable limitations (technological, organizational, financial, compliance) that shape the system architecture.

## 1. Technical Constraints
* **Programming Language**: The core codebase must be written in TypeScript, Go, or Python.
* **Database restrictions**: Must use Postgres for transactional data. No shared database across bounded contexts is permitted if microservices are chosen.
* **Target Environment**: Multi-region AWS deployment using Kubernetes or Serverless container runtimes.

## 2. Business & Organization Constraints
* **Time-to-Market**: Initial prototype must be deployed in less than 3 months.
* **Team Structure**: Small, agile team of 5 developers with advanced knowledge of clean code and TDD.
* **Budget Limits**: Infrastructure expenses must not exceed $500/month during the beta phase.

## 3. Compliance & Security Constraints
* **Regulatory Compliance**: Must comply with GDPR rules for user data storage.
* **Data Residency**: Customer data must reside in the EU West region.
