# Migration Pathways (Caminhos de Migração)

Instruções para guiar migrações estruturais de forma segura.

## 1. Migração de Monólito Simples para Monólito Modular
* **Etapa 1**: Identificar os principais Bounded Contexts lógicos (ex: faturamento, autenticação, catálogo).
* **Etapa 2**: Criar namespaces ou pastas separadas para cada módulo sob `src/modules/`.
* **Etapa 3**: Isolar as tabelas de banco de dados por prefixos lógicos.
* **Etapa 4**: Substituir importações diretas de arquivos entre módulos por chamadas de interfaces públicas.

## 2. Migração de Síncrono (REST) para Assíncrono (Event-Driven)
* **Etapa 1**: Implementar o padrão Transactional Outbox para garantir consistência.
* **Etapa 2**: Introduzir um broker (ex: RabbitMQ/SQS).
* **Etapa 3**: Mudar endpoints de escrita síncronos para responderem imediatamente `202 Accepted` após colocar o comando na fila.
