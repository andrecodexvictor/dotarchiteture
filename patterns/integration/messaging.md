# Integration Pattern: Messaging (Mensageria)

## Propósito
Intercambio assíncrono de dados através de um broker de mensagens (RabbitMQ, Kafka, SQS) usando filas ou tópicos pub/sub.

## Vantagens
* Desacoplamento espacial e temporal.
* Nivelamento de picos de carga (throttling).
* Facilidade de escalabilidade de consumidores.
