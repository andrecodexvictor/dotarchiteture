# Integration Pattern: Event Sourcing

## Propósito
Persiste o estado de uma entidade de negócio salvando uma sequência imutável de eventos ordenados no tempo, em vez de salvar o estado atual.

## Quando usar
* Sistemas que exigem auditoria estrita de cada alteração de estado (ex: bancos, ledgers financeiros).
* Cenários onde o histórico de alterações fornece valor analítico de negócio.
