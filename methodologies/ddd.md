# Methodology: Domain-Driven Design (DDD)

## Objetivo
Alinhamento entre o design técnico do sistema e os processos de negócio por meio de colaboração contínua com Domain Experts.

## Quando Aplicar
Projetos com regras de negócio complexas, fluxos extensos ou múltiplos times (onde microsserviços ou monólitos modulares são considerados).

## Pré-requisitos
* Compreensão de linguagem ubíqua e mapeamento de contextos delimitados.
* Maturidade técnica intermediária/avançada.

## Impacto na Arquitetura
* Criação de agregados e limites claros no código.
* Isolamento de persistência e modelos puros de domínio.

## Sinais de Adoção
* Linguagem usada nas reuniões de produto é idêntica aos nomes das classes no código.
* Pasta `domain/` bem isolada.

## Incompatibilidades
Aplicações CRUD simples (onde MVC direto é muito mais ágil).
