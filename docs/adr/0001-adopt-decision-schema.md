# ADR-0001: Adotar Schema Formal para Validação de Entrada

## Status
Approved

## Contexto e Problema
A engine de decisão de arquitetura precisa receber dados consistentes sobre o projeto para produzir recomendações precisas. Dados ausentes ou formatados incorretamente reduzem a confiabilidade.

## Decisão Proposta
Adotamos o uso do `decision-input.schema.json` como o contrato de esquema de validação formal para todas as configurações de entrada analisadas pela CLI (`init` e `design`).

## Consequências
* **Positivas**: Redução de erros de parsing na inicialização, maior facilidade de depuração para usuários.
* **Negativas**: Usuários precisam manter o YAML em conformidade com o esquema JSON.
