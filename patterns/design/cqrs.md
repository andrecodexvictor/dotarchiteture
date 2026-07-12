# Design Pattern: CQRS (Command Query Responsibility Segregation)

## Propósito
Separação de responsabilidades de leitura (consultas) e escrita (comandos de alteração de estado) em caminhos de código e/ou bancos físicos distintos.

## Vantagens
* Permite otimizar e escalar o modelo de leitura independentemente do modelo de escrita.
* Reduz conflitos de concorrência.

## Quando usar
* Sistemas de alta escala física ou domínios de negócio complexos que exigem diferentes representações de dados para gravação e relatórios.
