# ADR-0005: Integrar Princípios de Team Topologies aos Limites Arquiteturais

## Status
Approved

## Contexto e Problema
A estrutura de times e sua comunicação moldam inevitavelmente os limites do software (Lei de Conway). A engine precisa considerar isso ao sugerir a modularização física.

## Decisão Proposta
A engine utilizará o número e maturidade das squads para sugerir times alinhados ao fluxo de valor (Stream-aligned teams) e justificar a recomendação de modularização de microsserviços.

## Consequências
* **Positivas**: Alinhamento imediato entre o desenho dos serviços na nuvem e a organização das equipes de desenvolvimento.
