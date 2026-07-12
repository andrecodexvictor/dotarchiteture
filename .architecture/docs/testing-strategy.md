# Testing Strategy & Observability

Guidelines for verifying execution and monitoring service deployments.

## Testing Guidelines
* Run unit and integration tests before pushing changes.
* Maintain clean layer isolation: mock external adapters when testing application use cases.

## Observability & Deploy
* Application Performance Monitoring (APM) para acompanhar gargalos de rota e consumo de CPU
* Rotação e agregação local de logs
* Deploy Rolling Update simples ou Blue-Green básico
