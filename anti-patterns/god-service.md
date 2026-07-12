# Anti-Pattern: God Service (Serviço Deus)

## Sintomas
Um único serviço em um ecossistema de microsserviços centraliza quase toda a lógica de negócio e banco de dados do sistema, enquanto os outros serviços apenas repassam dados ou fazem tarefas marginais.

## Consequências
* Gargalo de deploy e de escalabilidade, anula as vantagens de decomposição de microsserviços.

## Como evitar
* Modelagem cuidadosa de contextos delimitados usando Domain-Driven Design (DDD).
