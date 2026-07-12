# Integration Pattern: Webhook

## Propósito
Notificação ativa baseada em HTTP enviada de um servidor para clientes registrados quando um evento específico ocorre.

## Diretrizes
* Payload padronizado contendo ID do evento, timestamp e tipo.
* Validação de assinatura no cabeçalho (ex: HMAC SHA-256) para garantir autenticidade.
* Mecanismos de retry com backoff exponencial se o cliente falhar (responder diferente de 2xx).
