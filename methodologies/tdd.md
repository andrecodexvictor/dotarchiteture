# Methodology: Test-Driven Development (TDD)

## Objetivo
Processo de desenvolvimento onde a escrita de testes unitários precede a escrita do código de produção.

## Quando Aplicar
Durante a implementação de regras de negócio complexas, cálculos financeiros e utilitários compartilhados.

## Pré-requisitos
* Ferramentas de testes (Jest, Vitest, Go test) configuradas e integradas à IDE.
* Time com conhecimento técnico avançado.

## Impacto na Arquitetura
* Código altamente testável e fracamente acoplado.
* Incentiva o uso de interfaces e injeção de dependências.

## Sinais de Adoção
* Alta cobertura de testes (> 85%).
* Ciclo Red-Green-Refactor consolidado.

## Incompatibilidades
Prototipagem rápida de interfaces gráficas (UI/UX) e código experimental onde as regras mudam a cada hora.
