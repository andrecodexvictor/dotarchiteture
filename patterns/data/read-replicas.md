# Data Pattern: Read Replicas (Réplicas de Leitura)

## Propósito
Replicação assíncrona de dados de um nó de escrita principal (Primary/Master) para um ou mais nós de leitura (Read Replicas) para diluir carga de consultas pesadas.

## Quando usar
* Aplicações web com uma alta proporção de leitura/escrita (ex: 95% leitura, 5% escrita) para tirar carga de relatórios e consultas do banco principal.
