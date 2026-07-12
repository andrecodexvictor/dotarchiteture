# Pattern: Monolith (Monólito Simples)

## Propósito
Estrutura de deploy único onde toda a lógica de negócio, persistência e apresentação compartilham o mesmo processo.

## Vantagens
* Baixa complexidade operacional.
* Facilidade de testes locais e refatorações amplas.
* Deploy simples e rápido.

## Desvantagens
* Risco de acoplamento descontrolado (código espaguete).
* Gargalos de compilação e deploy à medida que o time cresce.
* Escalabilidade de hardware apenas vertical.

## Quando usar vs Evitar
* **Usar**: Projetos em estágio inicial (MVP), times pequenos (< 5 desenvolvedores), domínios de baixa complexidade.
* **Evitar**: Projetos de grande porte com vários times trabalhando no mesmo repositório.
