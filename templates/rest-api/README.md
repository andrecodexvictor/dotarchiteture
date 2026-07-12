# Template: REST API

Estrutura de organização padrão para endpoints REST.

## Estrutura de Pastas
* `src/controllers/`: Recebe as requisições HTTP, valida payloads de entrada e aciona serviços.
* `src/services/`: Lógica de processamento e operações.
* `src/routes/`: Mapeamento de rotas e vinculação de middlewares (auth, rate limiting).
* `src/middlewares/`: Componentes transversais de processamento de requisição (error handler, logger).
