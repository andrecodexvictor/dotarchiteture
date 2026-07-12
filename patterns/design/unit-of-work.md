# Design Pattern: Unit of Work

## Propósito
Mantém uma lista de transações de banco de dados afetadas por uma única transação de negócio e coordena a gravação de alterações e resolução de concorrência.

## Quando usar
* Quando múltiplos repositórios precisam compartilhar a mesma transação de banco de dados física para garantir atomicidade.
