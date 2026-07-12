# Template: Clean Architecture

Este template define a estrutura recomendada de pastas para projetos seguindo os princípios de Clean Architecture.

## Estrutura de Pastas
* `src/domain/`: Entidades de domínio puras e regras críticas de negócio corporativas.
* `src/use-cases/`: Casos de uso específicos da aplicação (orquestração).
* `src/interfaces/`: Controladores, apresentadores e conversores.
* `src/infrastructure/`: Drivers físicos de banco de dados, frameworks web e utilitários técnicos.

## Regras de Dependência
As dependências devem apontar apenas para dentro. Nada na camada de domínio ou casos de uso deve referenciar frameworks de infraestrutura diretamente.
