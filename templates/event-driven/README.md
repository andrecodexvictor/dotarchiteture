# Template: Event-Driven Architecture (EDA)

Estrutura recomendada para processamento de eventos.

## Estrutura de Pastas
* `src/events/publishers/`: Classes encarregadas de empacotar e publicar eventos.
* `src/events/subscribers/`: Ouvintes e manipuladores de tópicos específicos.
* `src/domain/events/`: Definições puras de contratos/tipos de eventos do negócio.
* `src/infrastructure/broker/`: Conectores físicos com o barramento de mensageria (Kafka, RabbitMQ).
