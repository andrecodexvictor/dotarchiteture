# Non-Functional Requirements Template

Define the performance, scalability, security, availability, and observability criteria.

## 1. Scale & Load
* **Peak Load**: Expected peak requests per second (RPS).
* **Data Volume**: Expected database growth rate per month.
* **Concurrency**: Maximum simultaneous active user sessions.

## 2. Performance & Latency
* **Response Time**: Target p95 response time for read/write requests (e.g. < 200ms).
* **Cold Starts**: Maximum cold start tolerance for serverless runtimes.

## 3. Availability & Resiliency
* **Target SLA**: Expected uptime percentage (e.g. 99.9%).
* **Disaster Recovery**: Target Recovery Point Objective (RPO) and Recovery Time Objective (RTO).
* **Fault Tolerance**: Core services must remain functional if secondary services fail.

## 4. Security & Compliance
* **Encryption**: Data must be encrypted at rest and in transit (TLS 1.3).
* **Audit Logs**: All state-modifying actions must produce an immutable audit log.
