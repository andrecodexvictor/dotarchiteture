# ADR-0003: Priorizar Monólito Modular como Padrão para Times Médios e Alta Complexidade

## Status
Approved

## Contexto e Problema
Muitos projetos de média complexidade adotam microsserviços precocemente, gerando custos operacionais severos sem benefícios tangíveis de escala física de início.

## Decisão Proposta
A engine prioriza recomendar `modular-monolith` para times entre 5 e 14 desenvolvedores quando a complexidade de domínio for alta ou média, em vez de saltar direto para `microservices`.

## Consequências
* **Positivas**: Evita o antipadrão Premature Microservices, preserva a simplicidade operacional com isolamento de limites lógicos.
