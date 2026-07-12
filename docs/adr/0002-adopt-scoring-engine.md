# ADR-0002: Adotar Engine de Scoring Baseada em Pesos e Limiares

## Status
Approved

## Contexto e Problema
Precisamos de recomendações reproduzíveis. Regras de decisão emaranhadas no código dificultam a manutenção e a customização de pesos.

## Decisão Proposta
Adotamos uma engine de decisão de dois níveis: resolvemos o estilo de alto nível (físico) e depois o padrão de código interno (lógico) usando limiares e pesos definidos externamente em YAML.

## Consequências
* **Positivas**: Regras auditáveis e facilmente mutáveis sem alteração do código TypeScript principal.
