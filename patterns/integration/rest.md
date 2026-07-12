# Integration Pattern: RESTful API

## Propósito
Comunicação síncrona cliente-servidor usando protocolo HTTP e verbos padronizados (GET, POST, PUT, DELETE) para gerenciar recursos.

## Diretrizes
* URLs no plural: `/api/v1/users`
* Status de retorno corretos (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error)
* Suporte a rate limiting e paginação.
