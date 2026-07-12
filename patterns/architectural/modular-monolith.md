# Pattern: Modular Monolith (Monólito Modular)

## Propósito
Estrutura de deploy único onde as regras de negócio são divididas em módulos lógicos isolados que se comunicam através de interfaces explícitas.

## Vantagens
* Excelente isolamento de domínio sem custos de rede.
* Caminho fácil de refatoração para microsserviços se necessário.
* Permite que múltiplos subtimes trabalhem de forma independente.

## Desvantagens
* Exige forte disciplina para manter barreiras lógicas intactas.
* Ferramentas de validação são necessárias para evitar importações cruzadas.

## Quando usar vs Evitar
* **Usar**: Sistemas de complexidade média/alta com times médios (5 a 15 devs) querendo evitar custos de microsserviços.
* **Evitar**: Projetos de baixíssima complexidade (MVP simples).
