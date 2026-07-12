# Design Pattern: Strategy

## Propósito
Permite definir uma família de algoritmos, encapsular cada um deles e torná-los intercambiáveis em tempo de execução.

## Estrutura
* **Context**: Mantém uma referência para uma das estratégias concretas.
* **Strategy Interface**: Declara o método comum executado pelo Context.
* **Concrete Strategy**: Implementa variações do algoritmo.

## Quando usar
* Quando você tem múltiplas formas de executar uma operação (ex: diferentes gateways de pagamento, taxas de envio).
