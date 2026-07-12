# Anti-Pattern: Distributed Monolith (Monólito Distribuído)

## Sintomas
Múltiplos serviços separados fisicamente por rede, mas que exigem deploys coordenados e possuem forte acoplamento temporal (chamadas síncronas em cascata).

## Consequências
* O pior de dois mundos: alta complexidade operacional de microsserviços + falta de flexibilidade de deploys e fragilidade a falhas do monólito.

## Como evitar
* Garantir desacoplamento por meio de comunicação orientada a eventos e isolamento de banco de dados.
