# Integration Pattern: Transactional Outbox

## Propósito
Garante a publicação confiável de eventos em sistemas distribuídos salvando o evento no banco de dados na mesma transação local em que a entidade de negócio é atualizada, para posterior publicação por um relay.

## Quando usar
* Obrigatório em microsserviços para evitar a perda de eventos ou inconsistência devido a falhas de rede após commits locais.
