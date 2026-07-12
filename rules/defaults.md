# Rules: Safe Defaults (Valores Padrão Seguros)

Este documento descreve as decisões padrão que a engine toma quando dados específicos do projeto não são fornecidos.

## Valores Padrão

* **Tamanho do Time**: Se não informado, assume-se `5` (tamanho médio de squad).
* **Maturidade do Time**: Assume-se `intermediate` para evitar simplificações excessivas ou boilerplates avançados.
* **Complexidade do Domínio**: Assume-se `medium`.
* **Escala / Disponibilidade**: Assume-se `low` para incentivar soluções enxutas e de baixo custo inicial.
* **Stack Alvo**: Default para `typescript/nestjs`.

## Decisões Seguras de Fallback
Quando nenhum limiar é superado, o modelo assume a arquitetura física de **Monólito Simples** (`monolith`) com padrão de código **MVC** (`mvc`) para maximizar a velocidade de entrega inicial.
