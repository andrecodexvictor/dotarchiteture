# Template: Hexagonal Architecture (Ports & Adapters)

Este template define a estrutura recomendada de pastas para projetos seguindo o padrão Hexagonal.

## Estrutura de Pastas
* `src/domain/`: Regras centrais, modelos e serviços de domínio.
* `src/ports/`: Interfaces TypeScript/interfaces abstratas definindo portas de entrada e saída.
* `src/adapters/primary/`: Drivers que acionam os casos de uso (HTTP controllers, CLI parsing).
* `src/adapters/secondary/`: Implementações de persistência de banco de dados e APIs externas.
